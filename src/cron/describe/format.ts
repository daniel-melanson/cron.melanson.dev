import { CronFieldKind } from "../types";
import { match as m, P } from "ts-pattern";

export function formatTimeUnit(value: number, leadingZeros = true): string {
  const s = value.toString();

  return leadingZeros ? s.padStart(2, "0") : s;
}

export function formatMonth(value: number): string {
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

export function formatDayOfWeek(value: number): string {
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

export function formatInteger(value: number): string {
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

export function format(kind: CronFieldKind, value?: number) {
  if (value === undefined) return kind.toLowerCase().replace(/_/g, "-");

  return m(kind)
    .with(CronFieldKind.DAY_OF_MONTH, () => formatInteger(value))
    .with(CronFieldKind.DAY_OF_WEEK, () => formatDayOfWeek(value))
    .with(CronFieldKind.MONTH, () => formatMonth(value))
    .otherwise(() => formatTimeUnit(value, false));
}
