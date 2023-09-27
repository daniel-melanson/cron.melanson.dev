function many(exp: RegExp): RegExp {
  return new RegExp(`${exp.source}*`);
}

function joinG(...exps: RegExp[]): RegExp {
  return new RegExp(`(${join(...exps).source})`);
}

function join(...exps: RegExp[]): RegExp {
  return new RegExp(exps.map((e) => e.source).join(""));
}

function oneOf(...exps: RegExp[]): RegExp {
  return new RegExp(`${exps.map((v) => v.source).join("|")}`);
}

function oneOfG(...exps: RegExp[]): RegExp {
  return new RegExp(`(${oneOf(...exps).source})`);
}

function oneOfN(name: string, ...exps: RegExp[]): RegExp {
  return new RegExp(`(?<${name}>${oneOf(...exps).source})`);
}

function optional(name: string, exp: RegExp): RegExp {
  return new RegExp(`(?<${name}>${exp.source})?`);
}

function named(name: string, exp: RegExp): RegExp {
  return new RegExp(`(?<${name}>${exp.source})`);
}

function pattern(...exps: RegExp[]): RegExp {
  return new RegExp(`^${join(...exps).source}$`);
}

function basicCronValue(value: RegExp) {
  const range = join(value, oneOfG(/-/, /~/), value);
  const namedRange = join(
    named("value", value),
    optional(
      "range",
      join(oneOfN("rangeSymbol", /-/, /~/), named("rangeEnd", value)),
    ),
  );

  const listStart = oneOfG(value, range);
  const listItem = joinG(/,/, listStart);

  return {
    wholePattern: pattern(
      oneOfG(
        named("wildcard", /\*/),
        named("value", value),
        named("range", range),
        named("list", join(listStart, many(listItem))),
      ),
      optional("step", joinG(/\//, named("stepValue", /\d+/))),
    ),
    listItemPattern: pattern(namedRange),
  };
}

interface CronVariantDescription {
  header: string;
  value: string;
}

interface CronField {
  name: string;
  wholePattern: RegExp;
  listItemPattern: RegExp;
  descriptions: CronVariantDescription[];
  validators: CronFieldValidator[];
}

export enum CronSyntaxType {
  UNIX = "UNIX",
  QUARTZ = "Quartz",
  AWS = "AWS",
}

type Result<T, E> = { success: true; value: T } | { success: false; error: E };

interface ExpressionDescription {
  text: string;
  nextDates: string[];
}

class InvalidCronExpressionError extends Error {
  public readonly partitions: string[];
  public readonly invalidFieldIndices: number[];
  constructor(partitions: string[], invalidFieldIndices: number[]) {
    super("Invalid cron expression.");
    this.partitions = partitions;
    this.invalidFieldIndices = invalidFieldIndices;
  }
}

export interface CronSyntax {
  type: CronSyntaxType;
  description: string;
  default: string;
  pattern: RegExp;
  fields: CronField[];
  describe: (
    expression: string,
  ) => Result<ExpressionDescription, InvalidCronExpressionError>;
}

class CronFieldBuilder {
  private name: string;
  private wholePattern: RegExp;
  private listItemPattern: RegExp;
  private validators: CronFieldValidator[] = [];
  private descriptions: CronVariantDescription[] = [];

  constructor(name: string, pattern: RegExp) {
    this.name = name;
    const { wholePattern, listItemPattern } = basicCronValue(pattern);
    this.wholePattern = wholePattern;
    this.listItemPattern = listItemPattern;
  }

  addValidator(validator: CronFieldValidator): this {
    this.validators.push(validator);
    return this;
  }

  addVariantDescription(header: string, value: string): this {
    this.descriptions.push({ header, value });
    return this;
  }

  build(): CronField {
    return {
      name: this.name,
      wholePattern: this.wholePattern,
      listItemPattern: this.listItemPattern,
      validators: this.validators,
      descriptions: this.descriptions,
    };
  }
}

type CronFieldValidator = (...matchedFields: RegExpMatchArray[]) => boolean;
class CronSyntaxBuilder {
  private type: CronSyntaxType;
  private description: string;
  private fields: CronField[] = [];
  private default: string = "";

  constructor(type: CronSyntaxType, description: string) {
    this.type = type;
    this.description = description;
  }

  setDefault(expression: string): this {
    this.default = expression;

    return this;
  }

  addField(field: CronFieldBuilder): this {
    this.fields.push(field.build());
    return this;
  }

  build(): CronSyntax {
    return {
      type: this.type,
      description: this.description,
      default: this.default,
      pattern: new RegExp(
        "^" +
          this.fields
            .map((field) =>
              field.wholePattern.source.replace(/(?<=\()\?\<\w+\>/g, ""),
            )
            .map((pattern) => pattern.substring(1, pattern.length - 1))
            .join(" ") +
          "$",
      ),
      describe: (expression) => {
        const partitions = partitionExpression(expression);

        const matchResults = this.fields.map(
          (field, i) =>
            partitions[i] && partitions[i].match(field.wholePattern),
        );

        const getInvalidFieldIndices = () => {
          const unmatchedFieldIndices = matchResults.reduce(
            (acc, x, i) => (x && x.length > 0 ? acc : [...acc, i]),
            [] as number[],
          );

          if (unmatchedFieldIndices.length > 0) return unmatchedFieldIndices;

          const fieldMatches = matchResults as RegExpMatchArray[];
          const invalidFields = fieldMatches.reduce((acc, x, i) => {
            const validationResults = this.fields[i].validators.map((f) =>
              f(x),
            );

            if (validationResults.some((b) => !b)) return [...acc, i];

            return acc;
          }, [] as number[]);

          return invalidFields;
        };

        const invalidFieldIndices = getInvalidFieldIndices();
        if (
          invalidFieldIndices.length > 0 ||
          partitions.length !== this.fields.length
        )
          return {
            success: false,
            error: new InvalidCronExpressionError(
              partitions,
              invalidFieldIndices,
            ),
          };

        // TODO describe string and get next dates

        return {
          success: true,
          value: {
            text: "At 12:00 on every 2nd day-of-month.",
            nextDates: [
              "2023-10-02 12:00:00",
              "2023-10-04 12:00:00",
              "2023-10-06 12:00:00",
              "2023-10-08 12:00:00",
              "2023-10-10 12:00:00",
            ],
          },
        };
      },
      fields: this.fields,
    };
  }
}

export function formatExpression(expression: string): string {
  const paddingRight = expression.match(/\s*$/)?.[0] ?? "";

  return expression.trim().split(/\s+/).join(" ") + paddingRight;
}

export function partitionExpression(expression: string): string[] {
  return expression.trim().split(/\s+/);
}

export const SYNTAX_LIST = [
  new CronSyntaxBuilder(CronSyntaxType.UNIX, "Unix/Linux specification.")
    .setDefault("0 12 * * FRI")
    .addField(
      new CronFieldBuilder("minute", /[0-5]?\d/).addVariantDescription(
        "0-59",
        "allowed values",
      ),
    )
    .addField(
      new CronFieldBuilder(
        "hour",
        oneOf(/[01]?\d/, /2[0-3]/),
      ).addVariantDescription("0-23", "allowed values"),
    )
    .addField(
      new CronFieldBuilder(
        "day-of-month",
        oneOf(/[0-2]?\d/, /3[01]/),
      ).addVariantDescription("1-31", "allowed values"),
    )
    .addField(
      new CronFieldBuilder(
        "month",
        oneOf(
          /[1-9]/,
          /1[012]/,
          /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/,
        ),
      )
        .addVariantDescription("1-12", "allowed values")
        .addVariantDescription("JAN-DEC", "alternative values"),
    )
    .addField(
      new CronFieldBuilder(
        "day-of-week",
        oneOf(/[0-7]/, /MON|TUE|WED|THU|FRI|SAT|SUN/),
      )
        .addVariantDescription("0-7", "allowed values")
        .addVariantDescription("SUN-SAT", "alternative values"),
    )
    .build(),
  new CronSyntaxBuilder(CronSyntaxType.AWS, "AWS Lambda cron.")
    .setDefault("* * * * * *")
    .build(),
  new CronSyntaxBuilder(CronSyntaxType.QUARTZ, "Quarts scheduler cron.")
    .setDefault("* * * * * * *")
    .build(),
] satisfies CronSyntax[];
