/** Same behavior as api/lib — strip wrapping quotes from cached or legacy responses */
export function stripOuterQuotationMarks(s) {
  let t = typeof s === "string" ? s.trim() : "";
  if (t.length < 2) return t;
  const pairs = [
    ['"', '"'],
    ["\u201c", "\u201d"],
    ["\u2018", "\u2019"],
    ["\u00ab", "\u00bb"],
    ["'", "'"],
  ];
  for (let depth = 0; depth < 3; depth++) {
    let changed = false;
    for (const [open, close] of pairs) {
      if (
        t.length >= open.length + close.length &&
        t.startsWith(open) &&
        t.endsWith(close)
      ) {
        t = t.slice(open.length, t.length - close.length).trim();
        changed = true;
        break;
      }
    }
    if (!changed) break;
  }
  return t;
}
