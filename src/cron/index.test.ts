import type { CronSyntax } from "./CronSyntax";
import { CRON_SYNTAX } from "./index";
import { CronExpressionDescription } from "./types";

function expectTextCron(cron: CronSyntax, expression: string, text: string) {
  const result = cron.describe(expression);
  expect(result.ok).toBe(true);

  const descripton = result.val as CronExpressionDescription;
  expect(descripton.text.source).toBe(text);
}

describe("UNIX", () => {
  const cron = CRON_SYNTAX.UNIX;
  const expectText = (expression: string, text: string) =>
    expectTextCron(cron, expression, text);

  it("All wildcards", () => {
    expectText(
      "* * * * *",
      "Every minute, of every hour, of every day-of-month, of every month, on any day-of-week.",
    );
  });

  it("Specific times", () => {
    expectText(
      "35 15 * * *",
      "At 15:35, every day-of-month, of every month, on any day-of-week.",
    );
    expectText(
      "0 15 * * *",
      "At 15:00, every day-of-month, of every month, on any day-of-week.",
    );
    expectText(
      "0 1 * * *",
      "At 1:00, every day-of-month, of every month, on any day-of-week.",
    );
  });

  it("Any time on specific days.", () => {
    expectText(
      "* * 15 10 *",
      "Every minute, of every hour, on the 15th of October, on any day-of-week.",
    );
    expectText(
      "* * 23 NOV *",
      "Every minute, of every hour, on the 23rd of November, on any day-of-week.",
    );
  });

  it("nth days", () => {
    expectText(
      "* */2 * * *",
      "Every minute, of every 2nd hour, of every day-of-month, of every month, on any day-of-week.",
    );
    expectText(
      "* */10 * * *",
      "Every minute, of every 10th hour, of every day-of-month, of every month, on any day-of-week.",
    );
  });
});

describe("AWS", () => {
  // const cron = CRON_SYNTAX.AWS;
});

describe("Quartz", () => {
  // const cron = CRON_SYNTAX.Quartz;
});
