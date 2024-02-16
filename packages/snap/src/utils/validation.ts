import { ethers } from 'ethers';
import { CONFIG_ERROR_MESSAGES, CONFIG_KEYS } from 'src/chainConfig';
import type { ChainConfig } from 'src/keyring';
import { assert, define, object, optional, StructError } from 'superstruct';

import { throwError } from './util';

const EthereumAddress = define(
  'EthereumAddress',
  (value) => typeof value === 'string' && ethers.isAddress(value),
);

const Url = define('Url', (value) => {
  const urlPattern =
    /^(https?:\/\/)?[\w\\.-]+(:\d{2,6})?(\/[\\/\w \\.-]*)?(\?[\\/\w .\-=]*)?$/u;
  return typeof value === 'string' && urlPattern.test(value);
});

const PrivateKey = define('PrivateKey', (value) => {
  return typeof value === 'string' && ethers.isHexString(value);
});

const ChainConfigStruct = object({
  [CONFIG_KEYS.SIMPLE_ACCOUNT_FACTORY]: optional(EthereumAddress),
  [CONFIG_KEYS.ENTRY_POINT]: optional(EthereumAddress),
  [CONFIG_KEYS.BUNDLER_URL]: optional(Url),
  [CONFIG_KEYS.CUSTOM_VERIFYING_PAYMASTER_ADDRESS]: optional(EthereumAddress),
  [CONFIG_KEYS.CUSTOM_VERIFYING_PAYMASTER_PK]: optional(PrivateKey),
});

/**
 * Validate the chain configuration.
 *
 * @param config - The chain configuration.
 * @throws If the configuration is invalid.
 */
export function validateConfig(config: ChainConfig): void {
  try {
    assert(config, ChainConfigStruct);
  } catch (error) {
    if (error instanceof StructError) {
      let customMessage = `[Snap] Invalid chain configuration: ${error.message}`;
      const { path, value } = error;
      if (path.length === 0) {
        throwError(
          `[Snap] Chain configuration error: ${(error as Error).message}`,
        );
      }
      const fieldName = path[0];
      switch (fieldName) {
        case CONFIG_KEYS.SIMPLE_ACCOUNT_FACTORY:
          customMessage = `${
            CONFIG_ERROR_MESSAGES.INVALID_SIMPLE_ACCOUNT_FACTORY_ADDRESS
          } ${String(value)}`;
          break;
        case CONFIG_KEYS.ENTRY_POINT:
          customMessage = `${
            CONFIG_ERROR_MESSAGES.INVALID_ENTRY_POINT_ADDRESS
          } ${String(value)}`;
          break;
        case CONFIG_KEYS.BUNDLER_URL:
          customMessage = `${
            CONFIG_ERROR_MESSAGES.INVALID_BUNDLER_URL
          } ${String(value)}`;
          break;
        case CONFIG_KEYS.CUSTOM_VERIFYING_PAYMASTER_ADDRESS:
          customMessage = `${
            CONFIG_ERROR_MESSAGES.INVALID_CUSTOM_VERIFYING_PAYMASTER_ADDRESS
          } ${String(value)}`;
          break;
        case CONFIG_KEYS.CUSTOM_VERIFYING_PAYMASTER_PK:
          customMessage = `${
            CONFIG_ERROR_MESSAGES.INVALID_CUSTOM_VERIFYING_PAYMASTER_PK
          } ${String(value)}`;
          break;
        default:
          customMessage = `[Snap] Invalid chain configuration for ${fieldName}: ${String(
            value,
          )}`;
          break;
      }
      throwError(customMessage);
    } else {
      throwError(
        `[Snap] Chain configuration error: ${(error as Error).message}`,
      );
    }
  }
}
