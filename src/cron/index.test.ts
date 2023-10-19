import type { CronSyntax } from "./CronSyntax";
import { CRON_SYNTAX } from "./index";
import { CronExpressionDescription } from "./types";

function expectText(cron: CronSyntax, expression: string, text: string) {
  const result = cron.describe(expression);
  expect(result.ok).toBe(true);

  const descripton = result.val as CronExpressionDescription;
  expect(descripton.text.source).toBe(text);
}

describe("UNIX", () => {
  const cron = CRON_SYNTAX.UNIX;

  it("All wildcards", () => {
    expectText(
      cron,
      "* * * * *",
      "Every minute, of every hour, of every day-of-month, of every month, on any day-of-week.",
    );
  });

  it("Specific times", () => {
    expectText(
      cron,
      "35 15 * * *",
      "At 15:35, every day-of-month, of every month, on any day-of-week.",
    );
    expectText(
      cron,
      "0 15 * * *",
      "At 15:00, every day-of-month, of every month, on any day-of-week.",
    );
    expectText(
      cron,
      "0 1 * * *",
      "At 1:00, every day-of-month, of every month, on any day-of-week.",
    );
  });

  it("Any time on specific days.", () => {
    expectText(
      cron,
      "* * 15 10 *",
      "Every minute, of every hour, on the 15th of October, on any day-of-week.",
    );
    expectText(
      cron,
      "* * 23 NOV *",
      "Every minute of every hour on the 23rd of November, on any day-of-week.",
    );
  });

  it("nth days", () => {
    expectText(
      cron,
      "* */2 * * *",
      "Every minute of every hour every 2nd day.",
    );
    expectText(
      cron,
      "* */10 * * *",
      "Every minute of every hour every 10th day.",
    );
    expectText(
      cron,
      "* */3 * * *",
      "Every minute of every hour every 3rd day.",
    );
    expectText(cron, "0 0 */13th * * *", "At 00:00 every 13rd day.");
  });
});

describe("AWS", () => {
  // const cron = CRON_SYNTAX.AWS;
});

describe("Quartz", () => {
  // const cron = CRON_SYNTAX.Quartz;
});
