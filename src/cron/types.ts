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
export interface CronField {
  name: string;
  wholePattern: RegExp;
  listItemPattern: RegExp;
  variantDescriptions: CronFieldVariantDescription[];
  parse: (field: string) => CronFieldParseResult;
  validators: CronFieldValidator[];
}

export type CronFieldValidator = (...matches: CronFieldMatch[]) => boolean;

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
  on: Exclude<CronFieldMatch, CronFieldListMatch | CronFieldStepMatch>[];
  step: CronFieldValueMatch;
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
  items: Exclude<CronFieldMatch, CronFieldListMatch>[];
}

export interface CronFieldVariantDescription {
  header: string;
  value: string;
}

export interface CronExpressionDescription {
  text: string;
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
