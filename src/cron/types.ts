export enum CronSyntaxType {
  UNIX = "UNIX",
  QUARTZ = "Quartz",
  AWS = "AWS",
}

export interface CronSyntax {
  type: CronSyntaxType;
  description: string;
  default: string;
  pattern: RegExp;
  fields: CronField[];
  describe: (
    expression: string,
  ) => Result<CronExpressionDescription, InvalidCronExpressionError>;
}

export interface CronField {
  name: string;
  wholePattern: RegExp;
  listItemPattern: RegExp;
  descriptions: CronVariantDescription[];
  validators: CronFieldValidator[];
}

export interface CronVariantDescription {
  header: string;
  value: string;
}

type Result<T, E> = { success: true; value: T } | { success: false; error: E };

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

export type CronFieldValidator = (
  ...matchedFields: RegExpMatchArray[]
) => boolean;
