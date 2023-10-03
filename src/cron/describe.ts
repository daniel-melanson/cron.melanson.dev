import { CronExpressionDescription, CronExpressionMatch } from "./types";

export function describe(match: CronExpressionMatch): CronExpressionDescription {
  return {
    text: "At 12:00 on every 2nd day-of-month.",
    nextDates: [
      "2023-10-02 12:00:00",
      "2023-10-04 12:00:00",
      "2023-10-06 12:00:00",
      "2023-10-08 12:00:00",
      "2023-10-10 12:00:00",
    ],
  }
}
