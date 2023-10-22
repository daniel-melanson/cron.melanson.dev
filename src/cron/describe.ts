import { P, match as m } from "ts-pattern";
import {
  CronExpressionDescription,
  CronExpressionMatch,
  CronFieldKind,
  CronFieldMatch,
  CronFieldTextRanges,
} from "./types";
import { CronSyntax } from "./CronSyntax";

function formatTimeUnit(value: number, leadingZeros = true): string {
  const s = value.toString();

  return leadingZeros ? s.padStart(2, "0") : s;
}

function formatMonth(value: number): string {
  return m(value)
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
  return m(value)
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
  const suffix = m(digit)
    .with(1, () => "st")
    .with(2, () => "nd")
    .with(3, () => "rd")
    .otherwise(() => "th");

  return value.toString() + suffix;
}

function format(kind: CronFieldKind, value?: number) {
  if (value === undefined) return kind.toLowerCase().replace(/_/g, "-");

  return m(kind)
    .with(CronFieldKind.DAY_OF_MONTH, () => formatInteger(value))
    .with(CronFieldKind.DAY_OF_WEEK, () => formatDayOfWeek(value))
    .with(CronFieldKind.MONTH, () => formatMonth(value))
    .otherwise(() => formatTimeUnit(value, false));
}

class ExpressionDescription {
  private description: string = "";
  private ranges: CronFieldTextRanges = new Map();
  private trailingSpace = "";

  getText(): string {
    const text = this.description;
    return (
      text.charAt(0).toUpperCase() +
      text.slice(1, text.length - this.trailingSpace.length) +
      "."
    );
  }

  getRanges(): CronFieldTextRanges {
    return this.ranges;
  }

  field(s: string, kind: CronFieldKind): this {
    if (this.ranges.has(kind)) throw new Error("Field already added.");

    const start = this.description.length;
    const end = start + s.length;

    this.description += s;
    this.trailingSpace = "";

    this.ranges.set(kind, [start, end]);

    return this;
  }

  spacing(s = " "): this {
    if (this.description.length === 0) return this;

    this.description += s;
    this.trailingSpace = s;

    return this;
  }

  text(s: string): this {
    this.description += s;

    return this;
  }
}

interface Options {
  isFirst?: boolean;
  isRoot?: boolean;
  isListItem?: boolean;
}

function describeField(
  d: ExpressionDescription,
  match: CronFieldMatch,
  options: Options = {},
): string {
  const fieldKind = match.field.kind;

  const text = m(match)
    .with({ kind: "ANY" }, () =>
      m(fieldKind)
        .with(CronFieldKind.DAY_OF_WEEK, () => "on any day-of-week")
        .otherwise(
          () =>
            (options.isRoot && !options.isFirst ? "of every " : "every ") +
            format(fieldKind),
        ),
    )
    .with({ kind: "VALUE" }, ({ value }) =>
      m([fieldKind, options])
        .with(
          [CronFieldKind.DAY_OF_MONTH, P.any],
          () => `on the ${format(fieldKind, value)}`,
        )
        .with(
          [CronFieldKind.DAY_OF_WEEK, P.any],
          () => `on ${format(fieldKind, value)}`,
        )
        .with(
          [CronFieldKind.HOUR, { isRoot: true }],
          () => `of hour ${format(fieldKind, value)}`,
        )
        .otherwise(() => format(fieldKind, value)),
    )
    .with({ kind: "LIST" }, ({ items }) => {
      const list = items.map((item) =>
        describeField(d, item, { isListItem: true }),
      );

      const last = list.pop();

      return `${list.join(", ")} or ${last}`;
    })
    .with({ kind: "RANGE" }, ({ from, to, separator }) => {
      const prefix = separator === "-" ? "of every" : "a random";

      return `${prefix} ${format(fieldKind)} ${format(
        fieldKind,
        from,
      )} through ${format(fieldKind, to)}`;
    })
    .with({ kind: "STEP" }, ({ on, step }) => {
      const word = step === 1 ? "every" : `of every ${formatInteger(step)}`;

      if (on.kind === "ANY") return word + " " + format(fieldKind);

      return word + " " + describeField(d, on);
    })
    .otherwise(() => match.source);

  if (!options.isRoot) return text;

  d.field(text, fieldKind);

  d.spacing(", ");

  return text;
}

function describeTime(
  matches: CronFieldMatch[],
  d: ExpressionDescription,
): CronFieldMatch[] {
  const hasSeconds = matches[0].field.kind === CronFieldKind.SECOND;
  const timeBound = hasSeconds ? 3 : 2;

  type TimeMatch = CronFieldMatch | undefined;
  const timeMatches = matches.slice(0, timeBound) as TimeMatch[];

  if (timeMatches.length < 3) timeMatches.unshift(undefined);
  return m(timeMatches)
    .with(
      [P._, { kind: "VALUE" }, { kind: "VALUE" }],
      ([second, minute, hour]) => {
        d.text("at ")
          .field(formatTimeUnit(hour.value, false), CronFieldKind.HOUR)
          .spacing(":")
          .field(formatTimeUnit(minute.value), CronFieldKind.MINUTE);

        if (second && second.kind === "VALUE") {
          d.spacing(":")
            .field(formatTimeUnit(second.value), CronFieldKind.SECOND)
            .spacing(", ");

          return [second, minute, hour];
        } else {
          d.spacing(", ");

          return [minute, hour];
        }
      },
    )
    .otherwise(() => []);
}

export function describeMatch(
  syntax: CronSyntax,
  expression: CronExpressionMatch,
): CronExpressionDescription {
  const d = new ExpressionDescription();

  const fields = syntax.fields;
  const matches = fields.map((f) => expression[f.kind]);

  const processedEntries = describeTime(matches, d);

  let unprocessedEntries = matches.filter(
    (e) =>
      !processedEntries.includes(e) &&
      e.field.kind !== CronFieldKind.DAY_OF_WEEK,
  );

  const monthIndex = unprocessedEntries.findIndex(
    (e) => e.field.kind === CronFieldKind.MONTH,
  );

  unprocessedEntries = [
    ...unprocessedEntries.slice(0, monthIndex),
    expression[CronFieldKind.DAY_OF_WEEK],
    ...unprocessedEntries.slice(monthIndex),
  ];

  for (let i = 0; i < unprocessedEntries.length; i++) {
    const match = unprocessedEntries[i];
    const isFirst = i === 0;

    describeField(d, match, { isFirst, isRoot: true });
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
