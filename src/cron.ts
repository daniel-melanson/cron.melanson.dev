export enum CronSyntaxType {
  UNIX = "UNIX",
  QUARTZ = "Quartz",
  AWS = "AWS",
}

export interface CronSyntax {
  name: CronSyntaxType;
  description: string;
  pattern: RegExp;
}

export const SYNTAX_LIST = [
  {
    name: CronSyntaxType.UNIX,
    description: "Unix/Linux specification.",
    pattern: /^A+$/,
  },
  {
    name: CronSyntaxType.QUARTZ,
    description: "Quartz specification (bamboo).",
    pattern: /^B+$/,
  },
  {
    name: CronSyntaxType.AWS,
    description: "AWS (lambda & eventbridge).",
    pattern: /^C+$/,
  },
] satisfies CronSyntax[];

export const SYNTAX_PATTERNS = SYNTAX_LIST.reduce((a, s) => {
  a[s.name] = s.pattern.toString();
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
