import { Err, Ok, Result } from "ts-results";
import { cronValuePattern } from "./pattern";
import {
  CronFieldKind,
  CronFieldMatch,
  CronFieldVariantDescription,
} from "./types";

export class CronField {
  constructor(
    public readonly kind: CronFieldKind,
    public readonly wholePattern: RegExp,
    public readonly listItemPattern: RegExp,
    public readonly descriptions: CronFieldVariantDescription[],
    public readonly variantValueMap: Record<string, number>,
  ) {}

  public parse(field: string): Result<CronFieldMatch, string> {
    const match = field.match(this.wholePattern);

    if (!match) return new Err("Field does not match pattern.");

    const groups = match.groups!;
    if (!groups) return new Err("No groups.");

    try {
      return new Ok(this.parseMatch(groups));
    } catch (err) {
      return new Err(String(err));
    }
  }

  private parseFieldAtom(source: string): number {
    if (source in this.variantValueMap) return this.variantValueMap[source];

    const number = Number.parseInt(source);
    if (!Number.isInteger(number)) throw new Error("Not a number.");

    return number;
  }

  private parseFieldValue(groups: Record<string, string>): CronFieldMatch {
    if (groups.wildcard) return { field: this, kind: "ANY", source: groups.wildcard };
    else if (groups.value) {
      return {
        field: this,
        kind: "VALUE",
        source: groups.value,
        value: this.parseFieldAtom(groups.value),
      };
    } else if (groups.range) {
      const range = groups.range;
      const [rangeStart, rangeEnd] = range.split(/-|~/);

      return {
        field: this,
        kind: "RANGE",
        source: groups.range,
        separator: range.includes("-") ? "-" : "~",
        from: this.parseFieldAtom(rangeStart),
        to: this.parseFieldAtom(rangeEnd),
      };
    }

    throw new Error(
      "Unsupported group match: " + JSON.stringify(Object.keys(groups)),
    );
  }

  private parseMatch(groups: Record<string, string>): CronFieldMatch {
    if (groups.list) {
      const list = groups.list;
      const items = list.split(/,/).map((item) => {
        const match = item.match(this.listItemPattern);
        if (!match || !match.groups)
          throw new Error("List item does not match pattern.");

        return this.parseMatch(match.groups);
      });

      return { field: this, kind: "LIST", source: groups.list, items };
    }

    const atom = this.parseFieldValue(groups);
    if (groups.step) {
      const stepValue = Number.parseInt(groups.stepValue);
      if (!Number.isInteger(stepValue)) throw new Error("Not a number.");

      return {
        field: this,
        kind: "STEP",
        source: atom.source + groups.step,
        on: atom,
        step: stepValue,
      };
    }

    return atom;
  }
}

export class CronFieldBuilder {
  private kind: CronFieldKind;
  private wholePattern: RegExp;
  private listItemPattern: RegExp;
  private descriptions: CronFieldVariantDescription[] = [];
  private variantValueMap: Record<string, number> = {};

  constructor(kind: CronFieldKind, pattern: RegExp) {
    this.kind = kind;
    const { wholePattern, listItemPattern } = cronValuePattern(pattern);
    this.wholePattern = wholePattern;
    this.listItemPattern = listItemPattern;
  }

  addVariantDescription(header: string, value: string): this {
    this.descriptions.push({ header, value });
    return this;
  }

  setVariantValueMap(map: Record<string, number>): this {
    this.variantValueMap = map;
    return this;
  }

  build(): CronField {
    return new CronField(
      this.kind,
      this.wholePattern,
      this.listItemPattern,
      this.descriptions,
      this.variantValueMap,
    );
  }
}
