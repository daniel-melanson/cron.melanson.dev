import {
  CronExpressionValidator,
  CronFieldVariantDescription,
  CronSyntax,
  CronSyntaxKind,
  CronField,
  InvalidCronExpressionError,
  CronFieldParseResult,
  CronFieldMatch,
  CronFieldKind,
  CronExpressionMatch,
  Result,
} from "./types";
import { cronValuePattern, oneOf } from "./pattern";
import { describe } from "./describe";

export function formatExpression(expression: string): string {
  const paddingRight = expression.match(/\s*$/)?.[0] ?? "";

  return expression.trim().split(/\s+/).join(" ") + paddingRight;
}

export function partitionExpression(expression: string): string[] {
  return expression.trim().split(/\s+/);
}

class CronFieldBuilder {
  private kind: CronFieldKind;
  private wholePattern: RegExp;
  private listItemPattern: RegExp;
  private descriptions: CronFieldVariantDescription[] = [];
  private variantValueMap: Record<string, number> = {};

  constructor(kind: CronFieldKind, pattern: RegExp) {
    this.kind = kind;
    const { wholePattern, listItemPattern } = cronValuePattern(pattern);
    this.wholePattern = wholePattern;
    this.listItemPattern = listItemPattern;
  }

  addVariantDescription(header: string, value: string): this {
    this.descriptions.push({ header, value });
    return this;
  }

  setVariantValueMap(map: Record<string, number>): this {
    this.variantValueMap = map;
    return this;
  }

  private parseFieldAtom(source: string): number {
    if (source in this.variantValueMap) return this.variantValueMap[source];

    const number = Number.parseInt(source);
    if (!Number.isInteger(number)) throw new Error("Not a number.");

    return number;
  }

  private parseFieldValue(groups: Record<string, string>): CronFieldMatch {
    if (groups.wildcard) return { kind: "ANY", source: groups.wildcard };
    else if (groups.value) {
      return {
        kind: "VALUE",
        source: groups.value,
        value: this.parseFieldAtom(groups.value),
      };
    } else if (groups.range) {
      const range = groups.range;
      const [rangeStart, rangeEnd] = range.split(/-|~/);

      return {
        kind: "RANGE",
        source: groups.range,
        separator: range.includes("-") ? "-" : "~",
        from: this.parseFieldAtom(rangeStart),
        to: this.parseFieldAtom(rangeEnd),
      };
    }

    throw new Error(
      "Unsupported group match: " + JSON.stringify(Object.keys(groups)),
    );
  }

  private parseMatch(groups: Record<string, string>): CronFieldMatch {
    if (groups.list) {
      const list = groups.list;
      const items = list.split(/,/).map((item) => {
        const match = item.match(this.listItemPattern);
        if (!match || !match.groups)
          throw new Error("List item does not match pattern.");

        return this.parseMatch(match.groups);
      });

      return { kind: "LIST", source: groups.list, items };
    }

    const atom = this.parseFieldValue(groups);
    if (groups.step) {
      const stepValue = Number.parseInt(groups.stepValue);
      if (!Number.isInteger(stepValue)) throw new Error("Not a number.");

      return {
        kind: "STEP",
        source: atom.source + groups.step,
        on: atom,
        step: stepValue,
      };
    }

    return atom;
  }

  build(): CronField {
    return {
      kind: this.kind,
      wholePattern: this.wholePattern,
      variantDescriptions: this.descriptions,
      parse: (field) => {
        const match = field.match(this.wholePattern);

        if (!match)
          return {
            success: false,
            error: new Error("Field does not match pattern."),
          };

        const groups = match.groups!;
        if (!groups) return { success: false, error: new Error("No groups.") };

        try {
          return { success: true, value: this.parseMatch(groups) };
        } catch (err) {
          return { success: false, error: err as Error };
        }
      },
    };
  }
}

class CronSyntaxBuilder {
  private kind: CronSyntaxKind;
  private description: string;
  private fields: CronField[] = [];
  private defaultExpression: string = "";
  private validators: CronExpressionValidator[] = [];

  constructor(kind: CronSyntaxKind, description: string) {
    this.kind = kind;
    this.description = description;
  }

  setDefault(expression: string): this {
    this.defaultExpression = expression;

    return this;
  }

  addValidator(validator: CronExpressionValidator): this {
    this.validators.push(validator);

    return this;
  }

  addField(field: CronFieldBuilder): this {
    this.fields.push(field.build());
    return this;
  }

  build(): CronSyntax {
    const expressionPattern = new RegExp(
      "^" +
        this.fields
          .map((field) =>
            field.wholePattern.source.replace(/(?<=\()\?\<\w+\>/g, ""),
          )
          .map((pattern) => pattern.substring(1, pattern.length - 1))
          .join(" ") +
        "$",
    );

    const getUnsuccessfulIndices = (results: Result<unknown, unknown>[]) =>
      results.reduce(
        (acc, x, i) => (x.success ? acc : [...acc, i]),
        [] as number[],
      );

    return {
      kind: this.kind,
      description: this.description,
      defaultExpression: this.defaultExpression,
      expressionPattern: expressionPattern,
      describe: (expression) => {
        const partitions = partitionExpression(expression);

        // Parse each partition into a field.
        const fieldParseResults = this.fields.map((field, i) => {
          const partition = partitions[i];
          if (!partition)
            return { success: false, error: new Error("Missing field value.") };

          return field.parse(partition);
        }) satisfies CronFieldParseResult[];

        // Fail if any field was not parsed successfully.
        // TODO Do something with error values?
        const unparsedFieldIndices = getUnsuccessfulIndices(fieldParseResults);
        if (
          unparsedFieldIndices.length > 0 ||
          partitions.length !== this.fields.length
        )
          return {
            success: false,
            error: new InvalidCronExpressionError(
              partitions,
              unparsedFieldIndices,
            ),
          };

        // Build a match object from the parsed fields.
        const match = fieldParseResults.reduce((acc, x, i) => {
          if (!x.success) throw x.error;

          const field = this.fields[i];
          return { ...acc, [field.kind]: x.value };
        }, {} as CronExpressionMatch);

        // Validate the match object.
        // TODO Do something with error values?
        const invalidFieldIndices = getUnsuccessfulIndices(
          this.validators.map((validator) => validator(match)),
        );

        if (invalidFieldIndices.length > 0) {
          return {
            success: false,
            error: new InvalidCronExpressionError(
              partitions,
              invalidFieldIndices,
            ),
          };
        }

        return {
          success: true,
          value: describe(match),
        };
      },
      fields: this.fields,
    };
  }
}

const MONTH_VARIANT_VALUE_MAP = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const DAY_OF_WEEK_VARIANT_VALUE_MAP = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

export const CRON_SYNTAX = {
  [CronSyntaxKind.UNIX]: new CronSyntaxBuilder(
    CronSyntaxKind.UNIX,
    "Unix/Linux specification.",
  )
    .setDefault("0 12 * * FRI")
    .addField(
      new CronFieldBuilder(
        CronFieldKind.MINUTE,
        /[0-5]?\d/,
      ).addVariantDescription("0-59", "allowed values"),
    )
    .addField(
      new CronFieldBuilder(
        CronFieldKind.HOUR,
        oneOf(/[01]?\d/, /2[0-3]/),
      ).addVariantDescription("0-23", "allowed values"),
    )
    .addField(
      new CronFieldBuilder(
        CronFieldKind.DAY_OF_MONTH,
        oneOf(/[0-2]?\d/, /3[01]/),
      ).addVariantDescription("1-31", "allowed values"),
    )
    .addField(
      new CronFieldBuilder(
        CronFieldKind.MONTH,
        oneOf(
          /[1-9]/,
          /1[012]/,
          /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/,
        ),
      )
        .setVariantValueMap(MONTH_VARIANT_VALUE_MAP)
        .addVariantDescription("1-12", "allowed values")
        .addVariantDescription("JAN-DEC", "alternative values"),
    )
    .addField(
      new CronFieldBuilder(
        CronFieldKind.DAY_OF_WEEK,
        oneOf(/[0-7]/, /MON|TUE|WED|THU|FRI|SAT|SUN/),
      )
        .setVariantValueMap(DAY_OF_WEEK_VARIANT_VALUE_MAP)
        .addVariantDescription("0-7", "allowed values (sunday is 0 or 7)")
        .addVariantDescription("SUN-SAT", "alternative values"),
    )
    .build(),
  [CronSyntaxKind.AWS]: new CronSyntaxBuilder(
    CronSyntaxKind.AWS,
    "AWS Lambda cron.",
  )
    .setDefault("* * * * * *")
    .build(),
  [CronSyntaxKind.QUARTZ]: new CronSyntaxBuilder(
    CronSyntaxKind.QUARTZ,
    "Quarts scheduler cron.",
  )
    .setDefault("* * * * * * *")
    .build(),
};

export const CRON_SYNTAX_LIST = Object.values(CRON_SYNTAX);
