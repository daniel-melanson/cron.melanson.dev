import { P, match as m } from "ts-pattern";
import {
  CronExpressionDescription,
  CronExpressionMatch,
  CronFieldKind,
  CronFieldMatch,
} from "../types";
import { CronSyntax } from "../parse/CronSyntax";
import { TextDescription } from "./TextDescription";
import { format, formatInteger, formatTimeUnit } from "./format";

interface Options {
  isFirst?: boolean;
  isRoot?: boolean;
  isListItem?: boolean;
}

function describeField(
  d: TextDescription,
  match: CronFieldMatch,
  expression: CronExpressionMatch,
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
      m([fieldKind, options, expression])
        .with(
          [CronFieldKind.MONTH, { isRoot: true }, P.any],
          () => `in ${format(fieldKind, value)}`,
        )
        .with(
          [CronFieldKind.DAY_OF_MONTH, P.any, P.any],
          () => `on the ${format(fieldKind, value)}`,
        )
        .with(
          [CronFieldKind.DAY_OF_WEEK, P.any, P.any],
          () => `on ${format(fieldKind, value)}`,
        )
        .with(
          [CronFieldKind.HOUR, { isRoot: true }, P.any],
          () => `of hour ${format(fieldKind, value)}`,
        )
        .otherwise(() => format(fieldKind, value)),
    )
    .with({ kind: "LIST" }, ({ items }) => {
      const list = items.map((item) =>
        describeField(d, item, expression, { isListItem: true }),
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
      const word = step === 1 ? "every" : `every ${formatInteger(step)}`;

      if (on.kind === "ANY") return word + " " + format(fieldKind);

      return word + " " + describeField(d, on, expression);
    })
    .otherwise(() => match.source);

  if (!options.isRoot) return text;

  d.field(text, fieldKind).spacing(", ");

  return text;
}

function describeTime(
  matches: CronFieldMatch[],
  d: TextDescription,
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
  const d = new TextDescription();

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

    describeField(d, match, expression, { isFirst, isRoot: true });
  }

  const [source, ranges] = d.finalize();
  return {
    text: {
      source,
      ranges,
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
