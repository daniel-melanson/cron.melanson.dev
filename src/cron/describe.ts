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

function formatInteger(value: number): string {
  const lastTwo = value % 100;
  if (10 <= lastTwo && lastTwo <= 20) return value.toString() + "th";

  const digit = value % 10;
  const suffix = match(digit)
    .with(2, () => "nd")
    .with(3, () => "rd")
    .otherwise(() => "th");

  return value.toString() + suffix;
}

function format(kind: CronFieldKind, value?: number) {
  if (value === undefined) return kind.toLowerCase().replace(/_/g, "-");

  return match(kind)
    .with(CronFieldKind.DAY_OF_MONTH, () => formatInteger(value))
    .with(CronFieldKind.DAY_OF_WEEK, () => formatDayOfWeek(value))
    .with(CronFieldKind.MONTH, () => formatMonth(value))
    .otherwise(() => formatTimeUnit(value));
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

  spacing(s: string): this {
    if (this.description.length === 0) return this;

    this.description += s;
    return this;
  }
}

function describeField(
  field: CronFieldMatch,
  kind: CronFieldKind,
  isFirst = false,
  isRoot = false,
): string {
  return match(field)
    .with({ kind: "ANY" }, () =>
      match(kind)
        .with(CronFieldKind.DAY_OF_WEEK, () => "on any day-of-week")
        .otherwise(
          () => (isRoot && !isFirst ? "of every " : "every ") + format(kind),
        ),
    )
    .with({ kind: "VALUE" }, ({ value }) => format(kind, value))
    .with({ kind: "LIST" }, ({ items }) => {
      const list = items.map((item) => describeField(item, kind, false));
      const last = list.pop();

      return `${list.join(", ")} or ${last}`;
    })
    .with({ kind: "RANGE" }, ({ from, to, separator }) => {
      const word = separator === "-" ? "every" : "a random";

      return `${word} ${format(kind)} from ${format(
        kind,
        from,
      )} through ${format(kind, to)}`;
    })
    .with({ kind: "STEP" }, ({ on, step }) => {
      const word = step === 1 ? "every" : `every ${formatInteger(step)}`;

      if (on.kind === "ANY") return word + " " + format(kind);

      return word + " " + describeField(on, kind, false);
    })
    .otherwise(() => field.source);
}

export function describeMatch(
  synax: CronSyntax,
  expression: CronExpressionMatch,
): CronExpressionDescription {
  const d = new ExpressionDescription();

  const fields = synax.fields;

  const timeMatches = [] as (CronFieldMatch | undefined)[];
  const entriesToProcess = [] as CronFieldMatch[];

  const hasSeconds = fields[0].kind === CronFieldKind.SECOND;
  const timeBound = hasSeconds ? 3 : 2;
  for (let i = 0; i < fields.length; i++) {
    const match = expression[fields[i].kind];
    const array = i < timeBound ? timeMatches : entriesToProcess;

    array.push(match);
  }

  if (timeMatches.length < 3) timeMatches.unshift(undefined);
  match(timeMatches)
    .with(
      [P._, { kind: "VALUE" }, { kind: "VALUE" }],
      ([SECOND, MINUTE, HOUR]) => {
        d.text("at ")
          .field(formatTimeUnit(HOUR.value), CronFieldKind.HOUR)
          .text(":")
          .field(formatTimeUnit(MINUTE.value), CronFieldKind.MINUTE);

        if (SECOND && SECOND.kind === "VALUE") {
          d.text(":").field(formatTimeUnit(SECOND.value), CronFieldKind.SECOND);
        } else if (SECOND) {
          entriesToProcess.unshift(SECOND);
        }
      },
    )
    .otherwise(() => {
      const timeEntries = timeMatches.filter(
        (m) => m !== undefined,
      ) as CronFieldMatch[];

      entriesToProcess.unshift(...timeEntries);
    });

  for (let i = 0; i < entriesToProcess.length; i++) {
    const match = entriesToProcess[i];
    const kind = match.field.kind;

    const isFirst = i === 0;

    d.spacing(", ");
    d.field(describeField(match, kind, isFirst, true), kind);
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
