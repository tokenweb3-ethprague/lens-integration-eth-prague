import fs from 'fs'
import { getRandomAmountInvested, getRandomPercentageChange } from './randomize-token-data.js';

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

const rawTokenData = fs.readFileSync('./src/token-app/token-data.json');

let tokens: TokenData[] = JSON.parse(rawTokenData.toString('utf8'));

const tokenPriceChangeMap = new Map<string, number>()

export const getTokenDataBySymbol = (symbol: string): TokenData | undefined => {
  const token = tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase()) as TokenData

  let changePercent24h = tokenPriceChangeMap.get(token.symbol)
  if (changePercent24h === undefined) {
    changePercent24h = getRandomPercentageChange()
    tokenPriceChangeMap.set(token.symbol, changePercent24h)
  }

  return { ...token, changePercent24h }
}
