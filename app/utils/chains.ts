import { Chain, bscTestnet } from "wagmi/chains";
import { stringToAddress } from "./converters";

interface ChainConfig {
  chain: Chain;
  contractAddresses: {
    profile: string;
    challenge: string;
  };
}

/**
 * Get chain configs defined by environment variables.
 */
export function getSupportedChainConfigs(): ChainConfig[] {
  const chainConfigs: ChainConfig[] = [];
  if (
    process.env.NEXT_PUBLIC_BSC_TESTNET_PROFILE_CONTRACT_ADDRESS &&
    process.env.NEXT_PUBLIC_BSC_TESTNET_CHALLENGE_CONTRACT_ADDRESS
  ) {
    chainConfigs.push({
      chain: {
        ...bscTestnet,
        rpcUrls: {
          default: {
            http: ["https://data-seed-prebsc-1-s3.binance.org:8545"],
          },
          public: {
            http: ["https://data-seed-prebsc-1-s3.binance.org:8545"],
          },
        },
      },
      contractAddresses: {
        profile: process.env.NEXT_PUBLIC_BSC_TESTNET_PROFILE_CONTRACT_ADDRESS,
        challenge:
          process.env.NEXT_PUBLIC_BSC_TESTNET_CHALLENGE_CONTRACT_ADDRESS,
      },
    });
  }
  return chainConfigs;
}

/**
 * Get chains using supported chain configs.
 */
export function getSupportedChains(): Chain[] {
  return getSupportedChainConfigs().map((chainConfig) => chainConfig.chain);
}

/**
 * Get the first chain config from supported chains.
 */
export function getDefaultSupportedChainConfig(): ChainConfig {
  const chainConfigs = getSupportedChainConfigs();
  if (chainConfigs.length === 0) {
    throw new Error("Supported chain config is not found");
  } else {
    return chainConfigs[0];
  }
}

/**
 * Return config of specified chain if it supported, otherwise return config of default supported chain.
 */
export function chainToSupportedChainConfig(
  chain: Chain | undefined
): ChainConfig {
  for (const config of getSupportedChainConfigs()) {
    if (config.chain.id === chain?.id) {
      return config;
    }
  }
  return getDefaultSupportedChainConfig();
}

/**
 * Return id of specified chain if it supported, otherwise return value from default supported chain.
 */
export function chainToSupportedChainId(
  chain: Chain | undefined
): number | undefined {
  return chainToSupportedChainConfig(chain).chain.id;
}

/**
 * Return native currency symbol of specified chain if it supported, otherwise return value from default supported chain.
 */
export function chainToSupportedChainNativeCurrencySymbol(
  chain: Chain | undefined
): string | undefined {
  return chainToSupportedChainConfig(chain).chain.nativeCurrency.symbol;
}

/**
 * Return profile contract address of specified chain if it supported, otherwise return value from default supported chain.
 */
export function chainToSupportedChainProfileContractAddress(
  chain: Chain | undefined
): `0x${string}` | undefined {
  return stringToAddress(
    chainToSupportedChainConfig(chain).contractAddresses.profile
  );
}

/**
 * Return challenge contract address of specified chain if it supported, otherwise return value from default supported chain.
 */
export function chainToSupportedChainChallengeContractAddress(
  chain: Chain | undefined
): `0x${string}` | undefined {
  return stringToAddress(
    chainToSupportedChainConfig(chain).contractAddresses.challenge
  );
}
