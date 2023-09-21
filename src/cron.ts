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
    whole: pattern(
      oneOf(
        named("wildcard", /\*/),
        named("value", value),
        named("range", range),
        named("list", join(listStart, many(listItem)))
      ),
      optional("step", joinP(/\//, named("stepValue", /\d+/)))
    ),
    listItem: pattern(namedRange),
  };
}

const UNIX_CRON_REGEXS = {
  // minute         0-59
  minute: basicCronValue(/[0-5]?\d/),
  // hour           0-23
  hour: basicCronValue(oneOf(/[01]?\d/, /2[0-3]/)),
  // day of month   1-31
  dayOfMonth: basicCronValue(oneOf(/[0-2]?\d/, /3[01]/)),
  // month          1-12 (or names, see below)
  month: basicCronValue(
    oneOf(/[1-9]/, /1[012]/, /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC/)
  ),
  // day of week    0-7 (0 or 7 is Sunday, or use names)
  dayOfWeek: basicCronValue(oneOf(/[0-7]/, /MON|TUE|WED|THU|FRI|SAT|SUN/)),
};

// TODO
// validators instead of pattern
// - split input by space
// - check length
// - run each part against pattern
// - return violating indices

export enum CronSyntaxType {
  UNIX = "UNIX",
  QUARTZ = "Quartz",
  AWS = "AWS",
}

export interface CronSyntax {
  type: CronSyntaxType;
  description: string;
  pattern: RegExp;
}

export const SYNTAX_LIST = [
  {
    type: CronSyntaxType.UNIX,
    description: "Unix/Linux specification.",
    pattern: /^A+$/,
  },
  {
    type: CronSyntaxType.QUARTZ,
    description: "Quartz specification (bamboo).",
    pattern: /^B+$/,
  },
  {
    type: CronSyntaxType.AWS,
    description: "AWS (lambda & eventbridge).",
    pattern: /^C+$/,
  },
] satisfies CronSyntax[];

export const SYNTAX_PATTERNS = SYNTAX_LIST.reduce((a, s) => {
  a[s.type] = s.pattern.toString();
  return a;
}, {} as Record<string, string>);

interface ExpressionDescription {
  text: string;
  nextDates: string[];
}

export function describeExpression(expression: string): ExpressionDescription {
  return {
    text: "At 12:00 on every 2nd day-of-month.",
    nextDates: [
      "2023-10-02 12:00:00",
      "2023-10-04 12:00:00",
      "2023-10-06 12:00:00",
      "2023-10-08 12:00:00",
      "2023-10-10 12:00:00",
    ],
  };
}
