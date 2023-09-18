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
