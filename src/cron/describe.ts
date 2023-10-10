import { P, match } from "ts-pattern";
import {
  CronExpressionDescription,
  CronExpressionMatch,
  CronFieldKind,
  CronFieldMatch,
  CronFieldTextRanges,
} from "./types";
import { CronSyntax } from "./CronSyntax";

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

function formatKind(kind: CronFieldKind): string {
  return kind.toLowerCase().replace(/_/g, "-");
}

class ExpressionDescription {
  private description: string = "";
  private ranges: CronFieldTextRanges = new Map();

  getText(): string {
    const text = this.description;
    return text.charAt(0).toUpperCase() + text.slice(1) + ".";
  }

  getRanges(): CronFieldTextRanges {
    return this.ranges;
  }

  text(s: string): this {
    this.description += s;

    return this;
  }

  field(s: string, kind: CronFieldKind): this {
    if (this.ranges.has(kind)) throw new Error("Field already added.");

    const start = this.description.length;
    const end = start + s.length;

    this.text(s);

    this.ranges.set(kind, [start, end]);

    return this;
  }
}

function describeField(field: CronFieldMatch, kind: CronFieldKind): string {
  return match(field)
    .with({ kind: "ANY" }, () => "every " + formatKind(kind))
    .with({ kind: "VALUE" }, ({ value }) => {
      return match(kind)
        .with(CronFieldKind.DAY_OF_MONTH, () => formatDayOfMonth(value))
        .with(CronFieldKind.DAY_OF_WEEK, () => formatDayOfWeek(value))
        .with(CronFieldKind.MONTH, () => formatMonth(value))
        .otherwise(() => formatTimeUnit(value));
    })
    .otherwise(() => field.source);
}

export function describeMatch(
  synax: CronSyntax,
  expression: CronExpressionMatch,
): CronExpressionDescription {
  const d = new ExpressionDescription();

  const entries = Object.entries(expression) as [
    CronFieldKind,
    CronFieldMatch,
  ][];

  const timeEntries = entries.slice(0, 3);

  const entriesToProcess: [CronFieldKind, CronFieldMatch | undefined][] = [];
  const p = timeEntries.map(([_, v]) => v);
  console.log(p);
  match(p)
    .with(
      [P._, { kind: "VALUE" }, { kind: "VALUE" }],
      ([SECOND, MINUTE, HOUR]) => {
        d.text("at ")
          .field(formatTimeUnit(HOUR.value), CronFieldKind.HOUR)
          .text(":")
          .field(formatTimeUnit(MINUTE.value), CronFieldKind.MINUTE);

        if (SECOND && SECOND.kind === "VALUE") {
          d.text(":")
            .field(formatTimeUnit(SECOND.value), CronFieldKind.SECOND)
            .text(" o'clock");
        } else if (SECOND) {
          entriesToProcess.push([CronFieldKind.SECOND, SECOND]);
        }
      },
    )
    .otherwise(() => {
      entriesToProcess.push(...timeEntries);
    });

  entriesToProcess.push(...entries.slice(3));
  for (const [kind, field] of entriesToProcess) {
    if (field) {
      d.text(" ");

      d.field(
        describeField(field, kind as CronFieldKind),
        kind as CronFieldKind,
      );
    }
  }

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
