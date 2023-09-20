enum CronType {
  UNIX = "UNIX",
  QUARTZ = "Quartz",
  AWS = "AWS",
}

interface Syntax {
  name: CronType;
  description: string;
  pattern: RegExp;
}

export const SYNTAX_LIST = [
  {
    name: CronType.UNIX,
    description: "Unix/Linux specification.",
    pattern: /^.+$/,
  },
  {
    name: CronType.QUARTZ,
    description: "Quartz specification (bamboo).",
    pattern: /^.+$/,
  },
  {
    name: CronType.AWS,
    description: "AWS (lambda & eventbridge).",
    pattern: /^.+$/,
  },
] satisfies Syntax[];

export function describeExpression(expression: string): string {
  return "At 12:00 on every 2nd day-of-month.";
}

export function calculateNextDates(expression: string): string[] {
  return [
    "2023-10-02 12:00:00",
    "2023-10-04 12:00:00",
    "2023-10-06 12:00:00",
    "2023-10-08 12:00:00",
    "2023-10-10 12:00:00",
  ];
}
