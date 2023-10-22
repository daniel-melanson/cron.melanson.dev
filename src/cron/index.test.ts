import { CronSyntax } from "./parse/CronSyntax";
import { CRON_SYNTAX } from "./index";
import { CronExpressionDescription } from "./types";

function expectTextCron(cron: CronSyntax, expression: string, text: string) {
  const result = cron.describe(expression);
  expect(result.ok).toBe(true);

  const descripton = result.val as CronExpressionDescription;
  expect(descripton.text.source).toBe(text);
}

const makeExpectText =
  (cron: CronSyntax) => (expression: string, text: string) =>
    expectTextCron(cron, expression, text);

describe("UNIX", () => {
  const expectText = makeExpectText(CRON_SYNTAX.UNIX);

  it("all wildcards", () => {
    expectText(
      "* * * * *",
      "Every minute, of every hour, of every day-of-month, on any day-of-week, of every month.",
    );
  });

  it("specific times", () => {
    expectText(
      "35 15 * * *",
      "At 15:35, every day-of-month, on any day-of-week, of every month.",
    );

    expectText(
      "0 15 * * *",
      "At 15:00, every day-of-month, on any day-of-week, of every month.",
    );

    expectText(
      "0 1 * * *",
      "At 1:00, every day-of-month, on any day-of-week, of every month.",
    );
  });

  it("specific days", () => {
    expectText(
      "* * 15 * *",
      "Every minute, of every hour, on the 15th, on any day-of-week, of every month.",
    );

    expectText(
      "* * 1 * *",
      "Every minute, of every hour, on the 1st, on any day-of-week, of every month.",
    );
  });

  it("specific months", () => {
    expectText(
      "* * * NOV *",
      "Every minute, of every hour, of every day-of-month, on any day-of-week, in November.",
    );

    expectText(
      "* * * 11 *",
      "Every minute, of every hour, of every day-of-month, on any day-of-week, in November.",
    );
  });

  it("specific days of week", () => {
    expectText(
      "* * * * FRI",
      "Every minute, of every hour, on every Friday, of every month.",
    );

    expectText(
      "* * * * 0",
      "Every minute, of every hour, on every Sunday, of every month.",
    );
  });

  it("any time on specific days.", () => {
    expectText(
      "* * 15 10 *",
      "Every minute, of every hour, on the 15th, on any day-of-week, in October.",
    );

    expectText(
      "* * 23 NOV *",
      "Every minute, of every hour, on the 23rd, on any day-of-week, in November.",
    );
  });

  it("nth days", () => {
    expectText(
      "* */2 * * *",
      "Every minute, of every 2nd hour, of every day-of-month, on any day-of-week, of every month.",
    );

    expectText(
      "* */10 * * *",
      "Every minute, of every 10th hour, of every day-of-month, on any day-of-week, of every month.",
    );
  });

  it("ranges", () => {
    expectText(
      "* 1-5 * * *",
      "Every minute, of every hour 1 through 5, of every day-of-month, on any day-of-week, of every month.",
    );
  });

  it("lists", () => {
    expectText(
      "* 1,5 * * *",
      "Every minute, of hour 1 or 5, of every day-of-month, on any day-of-week, of every month.",
    );

    expectText(
      "* * 1,2,4 * *",
      "Every minute, of every hour, on the 1st, 2nd, or 4th, on any day-of-week, of every month.",
    );
  });

  it("lists with ranges", () => {
    expectText(
      "* 1-5,10-15 * * *",
      "Every minute, of every hour 1 through 5 or of every hour 10 through 15, of every day-of-month, on any day-of-week, of every month.",
    );
  });

  it("lists with values and ranges", () => {
    expectText(
      "* 1,2-5,8 * * *",
      "Every minute, of hour 1, 2 through 5, or 8, of every day-of-month, on any day-of-week, of every month.",
    );
  });

  it("lists with steps", () => {
    expectText(
      "* 1,*/2 * * *",
      "Every minute, of hour 1 or every second hour, of every day-of-month, on any day-of-week, of every month.",
    );
  });

  it("day-of-month and day-of-week", () => {
    expectText(
      "* * 2 * TUES",
      "Every minute, of every hour, on the 2nd, or on any Tuesday, of every month.",
    );
    expectText(
      "* * 1 * 3",
      "Every minute, of every hour, on the 1st, or on any Wednesday, of every month.",
    );
  });

  it("day-of-month and day-of-week", () => {
    expectText(
      "* * 1 * 4",
      "Every minute, of every hour, on the 1st, or on any Wednesday, of every month.",
    );
    expectText(
      "* * */2 * 4",
      "Every minute, of every hour, of every 2nd day-of-month, that is a Thursday, of every month.",
    );
  });
});

describe("AWS", () => {
  // const cron = CRON_SYNTAX.AWS;
});

describe("Quartz", () => {
  // const cron = CRON_SYNTAX.Quartz;
});
