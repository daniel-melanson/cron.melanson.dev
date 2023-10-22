import { Err, Ok, Result } from "ts-results";
import { CronField, CronFieldBuilder } from "./CronField";
import {
  CronExpressionDescription,
  CronExpressionMatch,
  CronExpressionValidator,
  CronFieldParseResult,
  CronSyntaxKind,
} from "../types";
import { formatExpression, partitionExpression } from "../util";
import { describeMatch } from "../describe";

const getUnsuccessfulIndices = (results: Result<unknown, unknown>[]) =>
  results.reduce((acc, x, i) => (x.ok ? acc : [...acc, i]), [] as number[]);

export class CronSyntax {
  constructor(
    public readonly kind: CronSyntaxKind,
    public readonly description: string,
    public readonly fields: CronField[],
    public readonly defaultExpression: string,
    public readonly validators: CronExpressionValidator[],
  ) {}

  describe(
    expression: string,
  ): Result<
    CronExpressionDescription,
    { invalidFieldIndices: number[]; partitions: string[]; reasons: string[] }
  > {
    const partitions = partitionExpression(formatExpression(expression));

    // Parse each partition into a field.
    const fieldParseResults = this.fields.map((field, i) => {
      const partition = partitions[i];
      if (!partition) return new Err("Missing field value.");

      return field.parse(partition);
    }) satisfies CronFieldParseResult[];

    // Fail if any field was not parsed successfully.
    const unparsedFieldIndices = getUnsuccessfulIndices(fieldParseResults);
    if (
      unparsedFieldIndices.length > 0 ||
      partitions.length !== this.fields.length
    )
      return new Err({
        partitions,
        invalidFieldIndices: unparsedFieldIndices,
        reasons: fieldParseResults
          .filter((r) => !r.ok)
          .map((r) => r.val as string),
      });

    // Build a match object from the parsed fields.
    const match = fieldParseResults.reduce((acc, x, i) => {
      if (x.err) throw new Error(x.val);

      const field = this.fields[i];
      return { ...acc, [field.kind]: x.val };
    }, {} as CronExpressionMatch);

    // Validate the match object.
    const validationResults = this.validators.map((validator) =>
      validator(match),
    );
    const invalidFieldIndices = getUnsuccessfulIndices(validationResults);

    if (invalidFieldIndices.length > 0) {
      return new Err({
        partitions,
        invalidFieldIndices,
        reasons: validationResults
          .filter((r) => !r.ok)
          .map((r) => r.val as string),
      });
    }

    return new Ok(describeMatch(this, match));
  }
}

export class CronSyntaxBuilder {
  private kind: CronSyntaxKind;
  private description: string;
  private fields: CronField[] = [];
  private defaultExpression: string = "";
  private validators: CronExpressionValidator[] = [];

  constructor(kind: CronSyntaxKind, description: string) {
    this.kind = kind;
    this.description = description;
  }

  setDefault(expression: string): this {
    this.defaultExpression = expression;

    return this;
  }

  addValidator(validator: CronExpressionValidator): this {
    this.validators.push(validator);

    return this;
  }

  addField(field: CronFieldBuilder): this {
    this.fields.push(field.build());
    return this;
  }

  build(): CronSyntax {
    return new CronSyntax(
      this.kind,
      this.description,
      this.fields,
      this.defaultExpression,
      this.validators,
    );
  }
}
