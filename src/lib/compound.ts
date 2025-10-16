export function simpleGrowth(p: number, rPct: number, years: number): number {
  return p * (1 + (rPct / 100) * years)
}

export function compoundGrowth(p: number, rPct: number, years: number): number {
  return p * Math.pow(1 + rPct / 100, years)
}

export function makeSeries(principal: number, ratePct: number, years: number) {
  const series = []
  
  for (let year = 0; year <= years; year++) {
    series.push({
      year,
      simple: simpleGrowth(principal, ratePct, year),
      compound: compoundGrowth(principal, ratePct, year)
    })
  }
  
  return series
}
