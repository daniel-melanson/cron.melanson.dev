import { Result } from "ts-results";
import { CronField } from "./CronField";

export enum CronSyntaxKind {
  UNIX = "UNIX",
  QUARTZ = "Quartz",
  AWS = "AWS",
}

export type CronFieldParseResult = Result<CronFieldMatch, string>;

export enum CronFieldKind {
  SECOND = "SECOND",
  MINUTE = "MINUTE",
  HOUR = "HOUR",
  DAY_OF_MONTH = "DAY_OF_MONTH",
  MONTH = "MONTH",
  DAY_OF_WEEK = "DAY_OF_WEEK",
  YEAR = "YEAR",
}

export type CronExpressionMatch = CronFieldMatch[];

export type CronExpressionValidator = (
  match: CronExpressionMatch,
) => Result<undefined, string>;

export type CronFieldMatch =
  | CronFieldStepMatch
  | CronFieldValueMatch
  | CronFieldAnyMatch
  | CronFieldRangeMatch
  | CronFieldListMatch;

interface CronFieldMatchBase {
  field: CronField;
  source: string;
}

interface CronFieldAnyMatch extends CronFieldMatchBase {
  kind: "ANY";
}

interface CronFieldStepMatch extends CronFieldMatchBase {
  kind: "STEP";
  on: CronFieldMatch;
  step: number;
}

interface CronFieldValueMatch extends CronFieldMatchBase {
  kind: "VALUE";
  value: number;
}

interface CronFieldRangeMatch extends CronFieldMatchBase {
  kind: "RANGE";
  from: number;
  to: number;
  separator: "-" | "~";
}

interface CronFieldListMatch extends CronFieldMatchBase {
  kind: "LIST";
  items: CronFieldMatch[];
}

export interface CronFieldVariantDescription {
  header: string;
  value: string;
}

export type CronFieldTextRanges = Map<CronFieldKind, [number, number]>;

export interface CronExpressionDescription {
  text: {
    source: string;
    ranges?: CronFieldTextRanges;
  };
  nextDates: string[];
}

