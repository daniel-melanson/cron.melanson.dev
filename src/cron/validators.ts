import { match } from "ts-pattern";
import { CronExpressionValidator, CronFieldMatch } from "./types";
import { Err, Ok } from "ts-results";

export const VALID_RANGES: CronExpressionValidator = (expression) => {
  function validateMatch(m: CronFieldMatch): boolean {
    return match(m)
      .with({ kind: "LIST" }, ({ items }) =>
        items.every((item) => validateMatch(item)),
      )
      .with({ kind: "RANGE" }, ({ from, to }) => from <= to)
      .otherwise(() => true);
  }

  const isValid = Object.values(expression).every(
    (m) => !m || validateMatch(m),
  );

  return isValid ? new Ok(undefined) : new Err("Invalid range.");
};
