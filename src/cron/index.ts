import {
  CronFieldValidator,
  CronVariantDescription,
  CronSyntax,
  CronSyntaxType,
  CronField,
  InvalidCronExpressionError,
} from "./types";
import { cronValuePattern, oneOf } from "./pattern";

export function formatExpression(expression: string): string {
  const paddingRight = expression.match(/\s*$/)?.[0] ?? "";

  return expression.trim().split(/\s+/).join(" ") + paddingRight;
}

export function partitionExpression(expression: string): string[] {
  return expression.trim().split(/\s+/);
}

class CronFieldBuilder {
  private name: string;
  private wholePattern: RegExp;
  private listItemPattern: RegExp;
  private validators: CronFieldValidator[] = [];
  private descriptions: CronVariantDescription[] = [];

  constructor(name: string, pattern: RegExp) {
    this.name = name;
    const { wholePattern, listItemPattern } = cronValuePattern(pattern);
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

export const CRON_SYNTAX = {
  [CronSyntaxType.UNIX]: new CronSyntaxBuilder(
    CronSyntaxType.UNIX,
    "Unix/Linux specification.",
  )
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
  [CronSyntaxType.AWS]: new CronSyntaxBuilder(
    CronSyntaxType.AWS,
    "AWS Lambda cron.",
  )
    .setDefault("* * * * * *")
    .build(),
  [CronSyntaxType.QUARTZ]: new CronSyntaxBuilder(
    CronSyntaxType.QUARTZ,
    "Quarts scheduler cron.",
  )
    .setDefault("* * * * * * *")
    .build(),
};

export const CRON_SYNTAX_LIST = Object.values(CRON_SYNTAX);
