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

export function optionalN(name: string, exp: RegExp): RegExp {
  return new RegExp(`(?<${name}>${exp.source})?`);
}

export function optional(exp: RegExp): RegExp {
  return new RegExp(`(${exp.source})?`);
}

export function named(name: string, exp: RegExp): RegExp {
  return new RegExp(`(?<${name}>${exp.source})`);
}

export function grouped(exp: RegExp): RegExp {
  return new RegExp(`(${exp.source})`);
}

export function pattern(...exps: RegExp[]): RegExp {
  return new RegExp(`^${join(...exps).source}$`);
}

export function cronValuePattern(value: RegExp) {
  const valueG = grouped(value);
  const range = joinG(valueG, oneOfG(/-/, /~/), valueG);

  const step = joinG(/\//, /\d+/);
  const stepN = joinG(/\//, named("stepValue", /\d+/));

  const listStart = joinG(oneOfG(value, range), optional(step));
  const listItem = joinG(/,/, listStart);

  return {
    wholePattern: pattern(
      oneOfG(
        joinG(
          oneOfG(
            named("wildcard", /\*/),
            named("value", value),
            named("range", range),
          ),
          optionalN("step", stepN),
        ),
        named("list", join(listStart, many(listItem))),
      ),
    ),
    listItemPattern: pattern(
      joinG(
        oneOfG(named("value", value), named("range", range)),
        optionalN("step", stepN),
      ),
    ),
  };
}
