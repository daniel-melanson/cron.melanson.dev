import { P, match } from "ts-pattern";
import {
  CronExpressionDescription,
  CronExpressionMatch,
  CronFieldKind,
  CronFieldMatch,
  CronFieldTextRanges,
} from "./types";

function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatMonth(value: number): string {
  return match(value)
    .with(1, () => "January")
    .with(2, () => "February")
    .with(3, () => "March")
    .with(4, () => "April")
    .with(5, () => "May")
    .with(6, () => "June")
    .with(7, () => "July")
    .with(8, () => "August")
    .with(9, () => "September")
    .with(10, () => "October")
    .with(11, () => "November")
    .with(12, () => "December")
    .run();
}

function formatDayOfWeek(value: number): string {
  return match(value)
    .with(P.union(0, 7), () => "Sunday")
    .with(1, () => "Monday")
    .with(2, () => "Tuesday")
    .with(3, () => "Wednesday")
    .with(4, () => "Thursday")
    .with(5, () => "Friday")
    .with(6, () => "Saturday")
    .run();
}

function formatDayOfMonth(value: number): string {
  const digit = value % 10;

  const suffix = match(digit)
    .with(2, () => "nd")
    .with(3, () => "rd")
    .otherwise(() => "th");

  return value.toString() + suffix;
}

class Description {
  private text: string = "";
  private ranges: CronFieldTextRanges = new Map();

  getText(): string {
    return this.text.charAt(0).toUpperCase() + this.text.slice(1) + ".";
  }

  getRanges(): CronFieldTextRanges {
    return this.ranges;
  }

  append(s: string): this {
    this.text += s;

    return this;
  }

  appendField(s: string, kind: CronFieldKind): this {
    if (this.ranges.has(kind)) throw new Error("Field already added.");

    const start = this.text.length;
    const end = start + s.length;

    console.log(s, kind);

    this.append(s);

    this.ranges.set(kind, [start, end]);

    return this;
  }
}

export function describe(
  expression: CronExpressionMatch,
): CronExpressionDescription {
  const d = new Description();
  const { SECOND, MINUTE, HOUR, DAY_OF_MONTH, MONTH, DAY_OF_WEEK, YEAR } =
    expression;

  // Describe time of day
  // match([SECOND, MINUTE, HOUR]).with(
  //   [P._, VALUE, VALUE],
  //   ([SECOND, MINUTE, HOUR]) => {
  //     d.append("at ")
  //       .appendField(formatTimeUnit(HOUR.value), CronFieldKind.HOUR)
  //       .append(":")
  //       .appendField(formatTimeUnit(MINUTE.value), CronFieldKind.MINUTE);
  //
  //     if (SECOND && SECOND.kind === "VALUE") {
  //       d.append(":")
  //         .appendField(formatTimeUnit(SECOND.value), CronFieldKind.SECOND)
  //         .append(" o'clock");
  //     } else if (SECOND) {
  //       describeField(d, SECOND, CronFieldKind.SECOND);
  //     }
  //   },
  // );

  return {
    text: {
      source: d.getText(),
      ranges: d.getRanges(),
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
