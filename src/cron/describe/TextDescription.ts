import { CronFieldKind, CronFieldTextRanges } from "../types";

enum ElementKind {
  FIELD,
  TEXT,
  SPACE,
}

type Element =
  | {
      kind: ElementKind.SPACE | ElementKind.TEXT;
      text: string;
    }
  | {
      kind: ElementKind.FIELD;
      text: string;
      fieldKind: CronFieldKind;
    };

export class TextDescription {
  private description: Element[] = [];

  finalize(): [string, CronFieldTextRanges] {
    while (this.isLast(ElementKind.SPACE)) {
      this.description.pop();
    }

    const descriptionText = this.description.map((e) => e.text).join("");
    const finalText =
      descriptionText.charAt(0).toUpperCase() + descriptionText.slice(1) + ".";

    const ranges = new Map<CronFieldKind, number[]>();

    this.description.reduce((acc, item) => {
      if (item.kind !== ElementKind.FIELD) return acc + item.text.length;

      const end = acc + item.text.length;
      ranges.set(item.fieldKind, [acc, end]);

      return end;
    }, 0);

    return [finalText, new Map()];
  }

  private getFieldIndex(fieldKind: CronFieldKind): number {
    return this.description.findIndex(
      (item) => item.kind === ElementKind.FIELD && item.fieldKind === fieldKind,
    );
  }

  field(s: string, fieldKind: CronFieldKind): this {
    if (this.getFieldIndex(fieldKind) !== -1)
      throw new Error("Field already added.");

    this.description.push({
      kind: ElementKind.FIELD,
      fieldKind: fieldKind,
      text: s,
    });

    return this;
  }

  removeField(kind: CronFieldKind): this {
    const i = this.getFieldIndex(kind);
    if (i === -1) return this;

    const hasSpacing = this.description[i + 1]?.kind === ElementKind.SPACE;

    this.description = this.description
      .slice(0, i)
      .concat(this.description.slice(hasSpacing ? i + 2 : i + 1));

    return this;
  }

  spacing(s = " "): this {
    if (this.description.length === 0) return this;

    this.description.push({ kind: ElementKind.SPACE, text: s });

    return this;
  }

  text(s: string): this {
    this.description.push({ kind: ElementKind.TEXT, text: s });

    return this;
  }

  private isLast(kind: ElementKind): boolean {
    return this.description[this.description.length - 1]?.kind === kind;
  }
}
