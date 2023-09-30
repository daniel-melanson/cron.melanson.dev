export function many(exp: RegExp): RegExp {
  return new RegExp(`${exp.source}*`);
}

export function joinG(...exps: RegExp[]): RegExp {
  return new RegExp(`(${join(...exps).source})`);
}

export function join(...exps: RegExp[]): RegExp {
  return new RegExp(exps.map((e) => e.source).join(""));
}

export function oneOf(...exps: RegExp[]): RegExp {
  return new RegExp(`${exps.map((v) => v.source).join("|")}`);
}

export function oneOfG(...exps: RegExp[]): RegExp {
  return new RegExp(`(${oneOf(...exps).source})`);
}

export function oneOfN(name: string, ...exps: RegExp[]): RegExp {
  return new RegExp(`(?<${name}>${oneOf(...exps).source})`);
}

export function optional(name: string, exp: RegExp): RegExp {
  return new RegExp(`(?<${name}>${exp.source})?`);
}

export function named(name: string, exp: RegExp): RegExp {
  return new RegExp(`(?<${name}>${exp.source})`);
}

export function pattern(...exps: RegExp[]): RegExp {
  return new RegExp(`^${join(...exps).source}$`);
}

export function cronValuePattern(value: RegExp) {
  const range = join(value, oneOfG(/-/, /~/), value);
  const namedRange = join(
    named("value", value),
    optional(
      "range",
      join(oneOfN("rangeSymbol", /-/, /~/), named("rangeEnd", value)),
    ),
  );

  const listStart = oneOfG(value, range);
  const listItem = joinG(/,/, listStart);

  return {
    wholePattern: pattern(
      oneOfG(
        named("wildcard", /\*/),
        named("value", value),
        named("range", range),
        named("list", join(listStart, many(listItem))),
      ),
      optional("step", joinG(/\//, named("stepValue", /\d+/))),
    ),
    listItemPattern: pattern(namedRange),
  };
}
