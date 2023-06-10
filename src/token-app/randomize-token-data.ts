import fs from 'fs'

type TokenData = {
  id: string,
  symbol: string,
  tokenUrl: string,
  icon: string,
  description: string,
  name: string,
  investedViaPost: string,
  changePercent24h: number,
}

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 66% chance negative, 33% chance positive
function getRandomPercentageChange(): number {
  if (randBetween(1, 3) > 1) {
    return Number(`-${randBetween(0, 25)}.${randBetween(0, 9)}`)
  }
  return Number(`${randBetween(0, 4)}.${randBetween(0, 9)}`)
}

function getRandomAmountInvested(): string {
  if (randBetween(1, 3) > 1) {
    return `$${randBetween(0, 49)}.${randBetween(0,9)}k`
  }
  return `$${randBetween(482, 999)}}`
}

;(async () => {
  const input = fs.readFileSync('./token-data.json');
  let tokens: TokenData[] = JSON.parse(input.toString('utf8'));

  tokens.forEach(token => {
    token.changePercent24h = getRandomPercentageChange()
    token.investedViaPost = getRandomAmountInvested()
  })

  fs.writeFileSync('./src/token-app/custom-token-data.json', JSON.stringify(tokens))
})()
