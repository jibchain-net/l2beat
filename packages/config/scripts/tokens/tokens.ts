import { getEnv } from '@l2beat/backend-tools'
import {
  CoinListPlatformEntry,
  CoingeckoClient,
  HttpClient,
} from '@l2beat/shared'
import {
  AssetId,
  ChainId,
  CoingeckoId,
  EthereumAddress,
} from '@l2beat/shared-pure'
import { providers } from 'ethers'

import { chains } from '../../src'
import { ChainConfig } from '../../src/common'
import { GeneratedToken, Output, SourceEntry } from '../../src/tokens/types'
import { ScriptLogger } from './utils/ScriptLogger'
import {
  readGeneratedFile,
  readTokensFile,
  saveResults,
} from './utils/fsIntegration'
import { getCoingeckoId } from './utils/getCoingeckoId'
import { getTokenInfo } from './utils/getTokenInfo'

main().catch((e: unknown) => {
  console.error(e)
})

// TODO:
// - load all generated into result and save result every time
async function main() {
  const logger = new ScriptLogger({})
  logger.notify('Running tokens script...\n')
  const coingeckoClient = getCoingeckoClient()
  let coinList: CoinListPlatformEntry[] | undefined = undefined
  const sourceToken = readTokensFile(logger)
  const output = readGeneratedFile(logger)
  const result: GeneratedToken[] = output.tokens

  function saveToken(token: GeneratedToken) {
    const index = result.findIndex((t) => t.id === token.id)

    if (index === -1) {
      result.push(token)
    } else {
      result[index] = token
    }

    const sorted = sortByChainAndName(result)
    saveResults(sorted)
  }

  for (const [chain, tokens] of Object.entries(sourceToken)) {
    const chainLogger = logger.prefix(chain)
    const chainConfig = getChainConfiguration(chainLogger, chain)
    const chainId = getChainId(chainLogger, chainConfig)

    for (const token of tokens) {
      const tokenLogger: ScriptLogger = chainLogger.addMetadata(token.symbol)

      const source = getSource(tokenLogger, chain, token)
      const supply = getSupply(tokenLogger, chain, token)
      const category = token.category ?? 'other'

      const existingToken = findTokenInOutput(output, chainId, token)

      if (existingToken) {
        const overrides = {
          coingeckoId: token.coingeckoId ?? existingToken.coingeckoId,
          category,
          source,
          supply,
        }
        for (const [key, value] of Object.entries(overrides)) {
          const existing = existingToken[key as keyof typeof existingToken]
          if (value !== existing) {
            tokenLogger.overriding(
              key,
              'from',
              existing?.toString() ?? 'undefined',
              'to',
              value.toString(),
            )
          }
        }
        const bridgedUsing = token.bridgedUsing ?? existingToken.bridgedUsing
        if (
          existingToken.bridgedUsing?.bridge !== bridgedUsing?.bridge ||
          existingToken.bridgedUsing?.slug !== bridgedUsing?.slug ||
          existingToken.bridgedUsing?.warning !== bridgedUsing?.warning
        ) {
          tokenLogger.overriding(
            'bridgedUsing',
            'from',
            JSON.stringify(existingToken.bridgedUsing ?? 'undefined'),
            'to',
            JSON.stringify(bridgedUsing ?? 'undefined'),
          )
        }

        saveToken({ ...existingToken, ...overrides, bridgedUsing })
        continue
      }

      tokenLogger.assert(
        token.address !== undefined,
        `Native asset detected - configure manually`,
      )
      console.log()
      tokenLogger.processing()

      if (coinList === undefined) {
        coinList = await coingeckoClient.getCoinList({
          includePlatform: true,
        })
      }

      const coingeckoId =
        token.coingeckoId ??
        getCoingeckoId(
          logger,
          coinList,
          chainConfig.coingeckoPlatform,
          token.address,
        )

      const info = await fetchTokenInfo(
        tokenLogger,
        coingeckoClient,
        coingeckoId,
        chainConfig,
        token.address,
        token.symbol,
      )

      const assetId = getAssetId(chainConfig, token, info.name)

      saveToken({
        id: assetId,
        name: info.name,
        coingeckoId: info.coingeckoId,
        address: token.address,
        symbol: token.symbol,
        decimals: info.decimals,
        deploymentTimestamp: info.deploymentTimestamp,
        coingeckoListingTimestamp: info.coingeckoListingTimestamp,
        category,
        iconUrl: info.iconUrl,
        chainId,
        source,
        supply,
        bridgedUsing: token.bridgedUsing,
      })

      tokenLogger.processed()
    }
  }
}

function getCoingeckoClient() {
  const env = getEnv()
  const coingeckoApiKey = env.optionalString('COINGECKO_API_KEY')
  const http = new HttpClient()
  const coingeckoClient = new CoingeckoClient(http, coingeckoApiKey)
  return coingeckoClient
}

function getChainConfiguration(logger: ScriptLogger, chain: string) {
  const chainConfig = chains.find((c) => c.name === chain)
  logger.assert(
    chainConfig !== undefined,
    `Configuration not found, add chain configuration to project .ts file`,
  )
  return chainConfig
}

function getChainId(logger: ScriptLogger, chain: ChainConfig) {
  let chainId: ChainId | undefined = undefined
  try {
    chainId = ChainId(chain.chainId)
  } catch {
    logger.assert(false, `ChainId not found for`)
  }
  return chainId
}

function getSource(
  tokenLogger: ScriptLogger,
  chain: string,
  entry: SourceEntry,
) {
  const type = chain === 'ethereum' ? 'canonical' : entry.source
  tokenLogger.assert(type !== undefined, `Missing type`)
  return type
}

function getSupply(
  tokenLogger: ScriptLogger,
  chain: string,
  entry: SourceEntry,
) {
  const formula = chain === 'ethereum' ? 'zero' : entry.supply
  tokenLogger.assert(formula !== undefined, `Missing formula`)
  return formula
}

function getAssetId(chain: ChainConfig, token: SourceEntry, name: string) {
  const chainPrefix = chain.name === 'ethereum' ? '' : `${chain.name}:`

  return AssetId(
    `${chainPrefix}${token.symbol.replaceAll(' ', '-').toLowerCase()}-${name
      .replaceAll(' ', '-')
      .toLowerCase()}`,
  )
}

function sortByChainAndName(result: GeneratedToken[]) {
  return result.sort((a, b) => {
    if (a.chainId !== b.chainId) {
      return Number(a.chainId) - Number(b.chainId)
    }
    return a.name.localeCompare(b.name)
  })
}

function findTokenInOutput(
  output: Output,
  chainId: ChainId | undefined,
  entry: SourceEntry,
): GeneratedToken | undefined {
  return output.tokens.find((e) => {
    if (chainId !== e.chainId) {
      return false
    }
    if (!e.address) {
      return e.symbol === entry.symbol
    }
    return e.address === entry.address
  })
}

async function fetchTokenInfo(
  logger: ScriptLogger,
  coingeckoClient: CoingeckoClient,
  coingeckoId: CoingeckoId,
  chain: ChainConfig,
  address: EthereumAddress,
  symbol: string,
) {
  const env = getEnv()
  const rpcUrl = env.optionalString(`${chain.name.toUpperCase()}_RPC_URL`)
  logger.assert(
    rpcUrl !== undefined,
    `Missing environmental variable: ${chain.name.toUpperCase()}_RPC_URL`,
  )
  const provider = new providers.JsonRpcProvider(rpcUrl)

  const tokenInfo = await getTokenInfo(
    logger,
    provider,
    coingeckoClient,
    address,
    symbol,
    coingeckoId,
  )

  return {
    name: tokenInfo.name,
    coingeckoId: tokenInfo.coingeckoId,
    decimals: tokenInfo.decimals,
    deploymentTimestamp: tokenInfo.deploymentTimestamp,
    coingeckoListingTimestamp: tokenInfo.coingeckoListingTimestamp,
    iconUrl: tokenInfo.iconUrl,
  }
}
