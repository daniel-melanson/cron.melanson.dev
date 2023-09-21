function many(exp: RegExp): RegExp {
  return new RegExp(`${exp.source}*`);
}

function joinP(...exps: RegExp[]): RegExp {
  return new RegExp(`(${join(...exps).source})`);
}

function join(...exps: RegExp[]): RegExp {
  return new RegExp(exps.map((e) => e.source).join(""));
}

function oneOf(...exps: RegExp[]): RegExp {
  return new RegExp(`${exps.map((v) => v.source).join("|")}`);
}

function oneOfP(...exps: RegExp[]): RegExp {
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
  const range = join(value, oneOfP(/-/, /~/), value);
  const namedRange = join(
    named("value", value),
    optional(
      "range",
      join(oneOfN("rangeSymbol", /-/, /~/), named("rangeEnd", value))
    )
  );

  const listStart = oneOfP(value, range);
  const listItem = joinP(/,/, listStart);

  return {
    wholePattern: pattern(
      oneOf(
        named("wildcard", /\*/),
        named("value", value),
        named("range", range),
        named("list", join(listStart, many(listItem)))
      ),
      optional("step", joinP(/\//, named("stepValue", /\d+/)))
    ),
    listItemPattern: pattern(namedRange),
  };
}

interface CronField {
  name: string;
  wholePattern: RegExp;
  listItemPattern: RegExp;
}

export enum CronSyntaxType {
  UNIX = "UNIX",
  QUARTZ = "Quartz",
  AWS = "AWS",
}

type ExpressionDescription =
  | InvalidExpressionDescription
  | ValidExpressionDescription;

interface InvalidExpressionDescription {
  isValid: false;
  badFieldIndices: number[];
}

interface ValidExpressionDescription {
  isValid: true;
  text: string;
  nextDates: string[];
}

export interface CronSyntax {
  type: CronSyntaxType;
  description: string;
  pattern: RegExp;
  fields: CronField[];
  describe: (expression: string) => ExpressionDescription;
}

class CronSyntaxBuilder {
  private type: CronSyntaxType;
  private description: string;
  private fields: CronField[] = [];

  constructor(type: CronSyntaxType, description: string) {
    this.type = type;
    this.description = description;
  }

  addField(name: string, pattern: RegExp): this {
    const { wholePattern, listItemPattern } = basicCronValue(pattern);
    this.fields.push({
      name,
      wholePattern,
      listItemPattern,
    });

    return this;
  }

  build(): CronSyntax {
    return {
      type: this.type,
      description: this.description,
      pattern: new RegExp(
        "^" +
          this.fields
            .map((field) =>
              field.wholePattern.source.replace(/(?<=\()\?\<\w+\>/g, "")
            )
            .map((pattern) => pattern.substring(1, pattern.length - 1))
            .join(" ") +
          "$"
      ),
      describe: (expression: string): ExpressionDescription => {
        const partitions = partitionExpression(expression);

        const fieldMatches = this.fields.map((field, i) => partitions[i] && partitions[i].match(field.wholePattern));

        const badFieldIndices = fieldMatches.reduce((acc, x, i) => x ? acc : [...acc, i], [] as number[]);
        if (badFieldIndices.length > 0)
          return { isValid: false, badFieldIndices };

        // TODO: Implement
        // fieldMatches is full of good matches
        // describe each match as a string
        // join strings with " "
        // calculate next dates

        return {
          isValid: true,
          text: "At 12:00 on every 2nd day-of-month.",
          nextDates: [
            "2023-10-02 12:00:00",
            "2023-10-04 12:00:00",
            "2023-10-06 12:00:00",
            "2023-10-08 12:00:00",
            "2023-10-10 12:00:00",
          ],
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
    .addField("minute", /[0-5]?\d/)
    .addField("hour", oneOf(/[01]?\d/, /2[0-3]/))
    .addField("dayOfMonth", oneOf(/[0-2]?\d/, /3[01]/))
    .addField(
      "month",
      oneOf(
        /[1-9]/,
        /1[012]/,
        /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/
      )
    )
    .addField("dayOfWeek", oneOf(/[0-7]/, /MON|TUE|WED|THU|FRI|SAT|SUN/))
    .build(),
  new CronSyntaxBuilder(CronSyntaxType.AWS, "AWS Lambda cron.")
    .addField("minute", /[0-5]?\d/)
    .addField("hour", oneOf(/[01]?\d/, /2[0-3]/))
    .addField("dayOfMonth", oneOf(/[0-2]?\d/, /3[01]/))
    .addField(
      "month",
      oneOf(
        /[1-9]/,
        /1[012]/,
        /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/
      )
    )
    .addField("dayOfWeek", oneOf(/[0-7]/, /MON|TUE|WED|THU|FRI|SAT|SUN/))
    .build(),
  new CronSyntaxBuilder(CronSyntaxType.QUARTZ, "Quarts scheduler cron.")
    .addField("minute", /[0-5]?\d/)
    .addField("hour", oneOf(/[01]?\d/, /2[0-3]/))
    .addField("dayOfMonth", oneOf(/[0-2]?\d/, /3[01]/))
    .addField(
      "month",
      oneOf(
        /[1-9]/,
        /1[012]/,
        /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/
      )
    )
    .addField("dayOfWeek", oneOf(/[0-7]/, /MON|TUE|WED|THU|FRI|SAT|SUN/))
    .build(),
] satisfies CronSyntax[];
