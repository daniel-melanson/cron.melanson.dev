import type { CronSyntax } from "./types";
import { CRON_SYNTAX } from "./index";

function expectText(cron: CronSyntax, expression: string, text: string) {
  const description = cron.describe(expression);
  expect(description.success).toBe(true);
  // @ts-ignore
  expect(description.value.text).toBe(text);
}

describe("UNIX", () => {
  const cron = CRON_SYNTAX.UNIX;

  it("Correctly describe all wildcards", () => {
    expectText(cron, "* * * * *", "Every minute.");
  });

  it("Correctly describe specific time", () => {
    expectText(cron, "35 15 * * *", "At 15:35.");
    expectText(cron, "0 15 * * *", "At 15:00.");
    expectText(cron, "0 1 * * *", "At 1:00.");
  });

  it("Correctly describe nth days", () => {
    expectText(cron, "* * */2 * * *", "Every 2nd day.");
    expectText(cron, "* * */10 * * *", "Every 10th day.");
    expectText(cron, "* * */3 * * *", "Every 3rd day.");
  });
});

describe("AWS", () => {
  const cron = CRON_SYNTAX.AWS;

  it("Correctly describe all wildcards", () => {
    expectText(cron, "* * * * * *", "Every minute.");
  });
});

describe("Quartz", () => {
  const cron = CRON_SYNTAX.Quartz;

  it("Correctly describe all wildcards", () => {
    expectText(cron, "* * * * * * *", "Every second.");
  });
});
