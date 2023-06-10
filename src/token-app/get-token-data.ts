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

const rawTokenData = fs.readFileSync('./src/token-app/custom-token-data.json');

let tokens: TokenData[] = JSON.parse(rawTokenData.toString('utf8'));

export const getTokenDataBySymbol = (symbol: string): TokenData | undefined => {
  return tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase())
}
