import {
  CronExpressionDescription,
  CronExpressionMatch,
  CronFieldKind,
  CronFieldTextRanges,
} from "./types";

function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, "0");
}

class Description {
  private text: string = "";
  private ranges: CronFieldTextRanges = new Map();

  append(s: string): this {
    this.text += s;

    return this;
  }

  appendField(s: string, kind: CronFieldKind): this {
    if (this.ranges.has(kind)) throw new Error("Field already added.");

    const start = this.text.length;
    const end = start + s.length;

    this.append(s);

    this.ranges.set(kind, [start, end]);

    return this;
  }
}

export function describe(
  match: CronExpressionMatch,
): CronExpressionDescription {
  const { SECOND, MINUTE, HOUR, DAY_OF_MONTH, MONTH, DAY_OF_WEEK, YEAR } =
    match;

  if (MINUTE.kind === "VALUE" && HOUR.kind === "VALUE") {
    let time = `at ${formatTimeUnit(HOUR.value)}:${formatTimeUnit(
      MINUTE.value,
    )}`;

    if (SECOND && SECOND.kind === "VALUE") {
      time += `:${formatTimeUnit(SECOND.value)}`;
    }
  }

  return {
    text: {
      source: "At 12:00 on every 2nd day-of-month.",
      ranges: new Map([
        [CronFieldKind.HOUR, [3, 5]],
        [CronFieldKind.MINUTE, [6, 8]],
        [CronFieldKind.DAY_OF_MONTH, [12, 34]],
      ]),
    },
    nextDates: [
      "2023-10-02 12:00:00",
      "2023-10-04 12:00:00",
      "2023-10-06 12:00:00",
      "2023-10-08 12:00:00",
      "2023-10-10 12:00:00",
    ],
  };
}
