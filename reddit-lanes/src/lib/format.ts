export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 10000) return `${(value / 1000).toFixed(1)}k`;
  if (value < 1000000) return `${Math.round(value / 1000)}k`;
  return `${(value / 1000000).toFixed(1)}m`;
}

export function formatTimeAgo(unixSeconds: number): string {
  const seconds = Math.max(0, Date.now() / 1000 - unixSeconds);

  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];

  let value = seconds;
  for (const [factor, label] of units) {
    if (value < factor) return `${Math.floor(value)}${label}`;
    value /= factor;
  }
  return `${Math.floor(value)}y`;
}
