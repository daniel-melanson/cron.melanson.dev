export enum CronSyntaxKind {
  UNIX = "UNIX",
  QUARTZ = "Quartz",
  AWS = "AWS",
}

export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

export interface CronSyntax {
  kind: CronSyntaxKind;
  description: string;
  defaultExpression: string;
  expressionPattern: RegExp;
  fields: CronField[];
  describe: (
    expression: string,
  ) => Result<CronExpressionDescription, InvalidCronExpressionError>;
}

export type CronFieldParseResult = Result<CronFieldMatch, Error>;

export enum CronFieldKind {
  SECOND = "SECOND",
  MINUTE = "MINUTE",
  HOUR = "HOUR",
  DAY_OF_MONTH = "DAY_OF_MONTH",
  MONTH = "MONTH",
  DAY_OF_WEEK = "DAY_OF_WEEK",
  YEAR = "YEAR",
}

export type CronExpressionMatch = Record<
  Exclude<CronFieldKind, "SECOND" | "YEAR">,
  CronFieldMatch
> & { SECOND: CronFieldMatch | undefined; YEAR: CronFieldMatch | undefined };

export interface CronField {
  kind: CronFieldKind;
  wholePattern: RegExp;
  variantDescriptions: CronFieldVariantDescription[];
  parse: (field: string) => CronFieldParseResult;
}

export type CronExpressionValidator = (
  match: CronExpressionMatch,
) => Result<never, Error>;

export type CronFieldMatch =
  | CronFieldStepMatch
  | CronFieldValueMatch
  | CronFieldAnyMatch
  | CronFieldRangeMatch
  | CronFieldListMatch;

interface CronFieldAnyMatch {
  kind: "ANY";
  source: string;
}

interface CronFieldStepMatch {
  kind: "STEP";
  source: string;
  on: CronFieldMatch;
  step: number;
}

interface CronFieldValueMatch {
  kind: "VALUE";
  source: string;
  value: number;
}

interface CronFieldRangeMatch {
  kind: "RANGE";
  source: string;
  from: number;
  to: number;
  separator: "-" | "~";
}

interface CronFieldListMatch {
  kind: "LIST";
  source: string;
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

export class InvalidCronExpressionError extends Error {
  public readonly partitions: string[];
  public readonly invalidFieldIndices: number[];
  constructor(partitions: string[], invalidFieldIndices: number[]) {
    super("Invalid cron expression.");
    this.partitions = partitions;
    this.invalidFieldIndices = invalidFieldIndices;
  }
}
