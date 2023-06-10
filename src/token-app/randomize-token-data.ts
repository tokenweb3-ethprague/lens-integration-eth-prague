function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 66% chance negative, 33% chance positive
export function getRandomPercentageChange(): number {
  if (randBetween(1, 3) > 1) {
    return Number(`-${randBetween(0, 25)}.${randBetween(0, 9)}`)
  }
  return Number(`${randBetween(0, 4)}.${randBetween(0, 9)}`)
}

export function getRandomAmountInvested(): string {
  if (randBetween(1, 3) > 1) {
    return `$${randBetween(0, 49)}.${randBetween(0,9)}k`
  }
  return `$${randBetween(482, 999)}`
}
