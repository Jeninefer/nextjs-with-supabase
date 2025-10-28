export function twMerge(...inputs: Array<string | false | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of inputs) {
    if (!value) continue;
    const tokens = typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : [value];
    for (const token of tokens) {
      if (typeof token !== 'string') continue;
      if (!seen.has(token)) {
        seen.add(token);
        result.push(token);
      }
    }
  }

  return result.join(' ');
}
