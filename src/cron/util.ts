export function formatExpression(expression: string): string {
  const paddingRight = expression.match(/\s*$/)?.[0] ?? "";

  return expression.trim().split(/\s+/).join(" ") + paddingRight;
}

export function partitionExpression(expression: string): string[] {
  return expression.trim().split(/\s+/);
}

export function getFieldIndices(expression: string): [number, number][] {
  const indices: [number, number][] = [];

  let start = 0;
  while (true) {
    const match = expression.match(/(\s*)(\S+)/);
    if (!match) break;

    const [_, padding, content] = match;

    start += padding.length;
    const end = start + content.length;

    indices.push([start, end]);

    start += content.length;

    expression = expression.substring(padding.length + content.length);
  }

  return indices;
}
