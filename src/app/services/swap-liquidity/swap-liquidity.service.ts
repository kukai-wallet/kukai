import { Injectable } from '@angular/core';
import dexterCalculations from 'dexCalcs/dist/index-mobile.min';
import { Amount } from './classes/Amount';
import Big from 'big.js';
import { ChartSeries } from '../../../app/components/ui/chart/chart.component';
import { CONSTANTS } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class SwapLiquidityService {
  readonly lqdTokenContract = 'KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo';
  readonly lqdContract = 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5';
  readonly tzBTCContract = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn';

  public storage = {};
  public dipdupContracts = [];

  constructor() {}

  async fetchContracts(offset = 0): Promise<void> {
    const baseUrl = `https://dex.dipdup.net/v1/graphql`;
    const req = {
      query: `{dipdupContract(where: {}, offset: ${offset}) {address, name, typename, updatedAt, createdAt}}`
    };
    try {
      const response = await (
        await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req)
        })
      ).json();
      if (response?.data?.dipdupContract?.length > 0) {
        this.dipdupContracts.concat(response.data.dipdupContract);
        await this.fetchContracts(offset + 100);
      } else if (offset === 0) {
        throw new Error();
      }
      return;
    } catch (e) {
      throw new Error();
    }
  }

  async fetchStorage(contract): Promise<void> {
    try {
      return await fetch(`${CONSTANTS.API_URL}/contracts/${contract}/storage`)
        .then((r) => r.json())
        .then((r) => {
          this.storage[contract] = {};
          this.storage[contract].total_pool = r['lqtTotal'];
          this.storage[contract].tez_pool = r['xtzPool'];
          this.storage[contract].token_pool = r['tokenPool'];
        });
    } catch (e) {
      throw new Error();
    }
  }

  settings(dex: string): {
    fee: string;
    burn: string;
    includeSubsidy: boolean;
  } {
    switch (dex) {
      case 'liquidityBaking':
        return { fee: '0.1', burn: '0.1', includeSubsidy: false };
      case 'quipuswap':
        return { fee: '0.3', burn: '0', includeSubsidy: false };
      default:
        return { fee: '0.3', burn: '0', includeSubsidy: false };
    }
  }

  createPoolAmounts(): { xtzPool: Amount; tokenPool: Amount } {
    const xtzPool = new Amount({
      rpcAmount: parseFloat(this.storage[this.lqdContract]?.tez_pool),
      decimalPlaces: 6
    });
    const tokenPool = new Amount({
      rpcAmount: parseFloat(this.storage[this.lqdContract]?.token_pool),
      decimalPlaces: 8
    });
    return { xtzPool, tokenPool };
  }

  calculateXtzToToken(xtzToSell, xtzPool, tokenPool, maxSlippage, dex): { expected; minimum; rate; impactDouble } {
    const expected = this.xtzToTokenExpectedReturn(xtzToSell, xtzPool, tokenPool, dex);
    const minimum = this.xtzToTokenMinimumReturn(expected, maxSlippage);
    const rate = this.xtzToTokenExchangeRateDisplay(xtzToSell, xtzPool, tokenPool, dex);
    const priceImpact = this.xtzToTokenPriceImpact(xtzToSell, xtzPool, tokenPool, dex);
    const impactDouble = priceImpact ?? 0;
    return { expected, minimum, rate, impactDouble };
  }

  calculateXtzToTokenFromToken(tokenToSell, xtzPool, tokenPool, maxSlippage, dex): { xtz; token } {
    const result = this.calculateTokenToXTZ(tokenToSell, xtzPool, tokenPool, maxSlippage, dex);
    const expected = this.xtzToTokenExpectedReturn(result.expected, xtzPool, tokenPool, dex);
    const minimum = this.xtzToTokenMinimumReturn(expected, maxSlippage);
    const rate = this.xtzToTokenExchangeRateDisplay(result.expected, xtzPool, tokenPool, dex);
    const priceImpact = this.xtzToTokenPriceImpact(result.expected, xtzPool, tokenPool, dex);
    const impactDouble = priceImpact ?? 0;
    return { xtz: result, token: { expected, minimum, rate, impactDouble } };
  }

  calculateTokenToXTZ(tokenToSell, xtzPool, tokenPool, maxSlippage, dex): { expected; minimum; rate; impactDouble } {
    const expected = this.tokenToXtzExpectedReturn(tokenToSell, xtzPool, tokenPool, dex);
    const minimum = this.tokenToXtzMinimumReturn(expected, maxSlippage);
    const rate = this.tokenToXtzExchangeRateDisplay(tokenToSell, xtzPool, tokenPool, dex);
    const priceImpact = this.tokenToXtzPriceImpact(tokenToSell, xtzPool, tokenPool, dex);
    const impactDouble = priceImpact ?? 0;
    return { expected, minimum, rate, impactDouble };
  }

  calculateTokenToXTZFromXTZ(xtzToSell, xtzPool, tokenPool, maxSlippage, dex): { xtz; token } {
    const result = this.calculateXtzToToken(xtzToSell, xtzPool, tokenPool, maxSlippage, dex);
    const expected = this.tokenToXtzExpectedReturn(result.expected, xtzPool, tokenPool, dex);
    const minimum = this.tokenToXtzMinimumReturn(expected, maxSlippage);
    const rate = this.tokenToXtzExchangeRateDisplay(result.expected, xtzPool, tokenPool, dex);
    const priceImpact = this.tokenToXtzPriceImpact(result.expected, xtzPool, tokenPool, dex);
    const impactDouble = priceImpact ?? 0;
    return { xtz: { expected, minimum, rate, impactDouble }, token: result };
  }

  calculateAddLiquidityXTZ(xtz, xtzPool, tokenPool, totalLiquidity, maxSlippage, dex): { liquidityExpected; liquidityMinimum; tokenRequired; exchangeRate } {
    const tokenRequired = this.addLiquidityTokenRequired(xtz, xtzPool, tokenPool, dex);
    const liquidityReturned = this.addLiquidityReturn(xtz, xtzPool, totalLiquidity, maxSlippage, dex);
    const exchangeRate = this.xtzToTokenExchangeRateDisplay(xtz, xtzPool, tokenPool, dex);
    return {
      liquidityExpected: liquidityReturned?.expected,
      liquidityMinimum: liquidityReturned?.minimum,
      tokenRequired,
      exchangeRate
    };
  }

  calculateAddLiquidityToken(token, xtzPool, tokenPool, totalLiquidity, maxSlippage, dex): { liquidityExpected; liquidityMinimum; xtzRequired; exchangeRate } {
    const xtzRequired = this.addLiquidityXtzRequired(token, xtzPool, tokenPool, dex);
    const liquidityReturned = this.addLiquidityReturn(xtzRequired, xtzPool, totalLiquidity, maxSlippage, dex);
    const exchangeRate = this.xtzToTokenExchangeRateDisplay(xtzRequired, xtzPool, tokenPool, dex);
    return {
      liquidityExpected: liquidityReturned?.expected,
      liquidityMinimum: liquidityReturned?.minimum,
      xtzRequired,
      exchangeRate
    };
  }

  calculateRemoveLiquidity(
    liquidityBurned,
    xtzPool,
    tokenPool,
    totalLiquidity,
    maxSlippage,
    dex
  ): { xtzExpected; xtzMinimum; tokenExpected; tokenMinimum; exchangeRate } {
    const xtzOut = this.removeLiquidityXtzReceived(liquidityBurned, totalLiquidity, xtzPool, maxSlippage, dex);
    const tokenOut = this.removeLiquidityTokenReceived(liquidityBurned, totalLiquidity, tokenPool, maxSlippage);
    const exchangeRate = this.xtzToTokenExchangeRateDisplay(xtzOut.expected, xtzPool, tokenPool, dex);

    return {
      xtzExpected: xtzOut?.expected,
      xtzMinimum: xtzOut?.minimum,
      tokenExpected: tokenOut?.expected,
      tokenMinimum: tokenOut?.minimum,
      exchangeRate
    };
  }

  xtzToTokenExpectedReturn(xtzToSell: Amount, xtzPool: Amount, tokenPool: Amount, dex): Amount {
    const xtz = xtzToSell.internalBigInt;
    const xPool = xtzPool.internalBigInt;
    const tPool = tokenPool.internalBigInt;
    const result = dexterCalculations.xtzToTokenTokenOutput(
      xtz.toString(),
      xPool.toString(),
      tPool.toString(),
      dex.fee.toString(),
      dex.burn.toString(),
      dex.includeSibsidy
    );
    return new Amount({
      rpcAmount: result?.toString() || '0',
      decimalPlaces: tokenPool.decimalPlaces
    });
  }

  xtzToTokenMinimumReturn(tokenAmount: Amount, slippage: number): Amount {
    const token = tokenAmount.internalBigInt;
    if (slippage < 0 || slippage > 1) {
      console.log(`slippage value supplied to 'xtzToTokenMinimumReturn' was not between 0 and 1: ${slippage}`);
      return undefined;
    }
    const result = dexterCalculations.xtzToTokenMinimumTokenOutput(token.toString(), slippage);
    return new Amount({
      rpcAmount: result?.value?.toString() || '0',
      decimalPlaces: tokenAmount.decimalPlaces
    });
  }

  xtzToTokenRequiredXtzFor(tokenAmount: Amount, xtzPool: Amount, tokenPool: Amount, dex): Amount {
    const tokenRequired = tokenAmount.internalBigInt;
    const xtzPoolRpc = xtzPool.internalBigInt;
    const tokenPoolRpc = tokenPool.internalBigInt;

    const result = dexterCalculations.xtzToTokenXtzInput(
      tokenRequired,
      xtzPoolRpc,
      tokenPoolRpc,
      tokenAmount.decimalPlaces,
      dex.fee.toString(),
      dex.burn.toString(),
      dex.includeSibsidy
    );
    return new Amount({ rpcAmount: result.toString() });
  }

  xtzToTokenExchangeRate(xtzToSell: Amount, xtzPool: Amount, tokenPool: Amount, dex): number {
    const xtz = xtzToSell.internalBigInt;
    const xtzPoolRpc = xtzPool.internalBigInt;
    const tokenPoolRpc = tokenPool.internalBigInt;

    const result = dexterCalculations.xtzToTokenExchangeRate(xtz, xtzPoolRpc, tokenPoolRpc, dex.fee.toString(), dex.burn.toString(), dex.includeSibsidy);
    return parseFloat(result.toString());
  }

  xtzToTokenExchangeRateDisplay(xtzToSell: Amount, xtzPool: Amount, tokenPool: Amount, dex): string {
    const xtz = xtzToSell.internalBigInt;
    const xPool = xtzPool.internalBigInt;
    const tPool = tokenPool.internalBigInt;
    const result = dexterCalculations.xtzToTokenExchangeRateForDisplay(
      xtz.toString(),
      xPool.toString(),
      tPool.toString(),
      tokenPool.decimalPlaces,
      dex.fee.toString(),
      dex.burn.toString(),
      dex.includeSibsidy
    );
    return result?.toString() ?? '0';
  }

  xtzToTokenPriceImpact(xtzToSell: Amount, xtzPool: Amount, tokenPool: Amount, dex): number {
    const xtz = xtzToSell.internalBigInt;
    const xtzPoolRpc = xtzPool.internalBigInt;
    const tokenPoolRpc = tokenPool.internalBigInt;

    const result = dexterCalculations.xtzToTokenPriceImpact(
      xtz.toString(),
      xtzPoolRpc.toString(),
      tokenPoolRpc.toString(),
      dex.fee.toString(),
      dex.burn.toString(),
      dex.includeSibsidy
    );
    return parseFloat(result?.toString() ?? 0);
  }

  tokenToXtzExpectedReturn(tokenToSell: Amount, xtzPool: Amount, tokenPool: Amount, dex): Amount {
    const token = tokenToSell.internalBigInt;
    const xtzPoolRpc = xtzPool.internalBigInt;
    const tokenPoolRpc = tokenPool.internalBigInt;
    const result = dexterCalculations.tokenToXtzXtzOutput(
      token.toString(),
      xtzPoolRpc.toString(),
      tokenPoolRpc.toString(),
      dex.fee.toString(),
      dex.burn.toString(),
      dex.includeSibsidy
    );
    return new Amount({
      rpcAmount: result?.toString() || '0',
      decimalPlaces: 6
    });
  }

  tokenToXtzMinimumReturn(xtzAmount: Amount, slippage: number): Amount {
    const xtz = xtzAmount.internalBigInt;

    if (slippage < 0 || slippage > 1) {
      console.log(`slippage value supplied to 'tokenToXtzMinimumReturn' was not between 0 and 1: ${slippage}`);
      return undefined;
    }

    const result = dexterCalculations.tokenToXtzMinimumXtzOutput(xtz.toString(), slippage);
    return new Amount({
      rpcAmount: result?.toString() || '0',
      decimalPlaces: 6
    });
  }

  tokenToXtzRequiredTokenFor(xtzAmount: Amount, xtzPool: Amount, tokenPool: Amount, dex): Amount {
    const xtzRequired = xtzAmount.internalBigInt;
    const xPool = xtzPool.internalBigInt;
    const tPool = tokenPool.internalBigInt;

    const result = dexterCalculations.tokenToXtzTokenInput(
      xtzRequired,
      xPool,
      tPool,
      tokenPool.decimalPlaces,
      dex.fee.toString(),
      dex.burn.toString(),
      dex.includeSibsidy
    );
    return new Amount({
      rpcAmount: result.toString(),
      decimalPlaces: tokenPool.decimalPlaces
    });
  }

  tokenToXtzExchangeRate(tokenToSell: Amount, xtzPool: Amount, tokenPool: Amount, dex): number {
    const token = tokenToSell.internalBigInt;
    const xtzPoolRpc = xtzPool.internalBigInt;
    const tokenPoolRpc = tokenPool.internalBigInt;

    const result = dexterCalculations.tokenToXtzExchangeRate(
      token.toString(),
      xtzPoolRpc,
      tokenPoolRpc,
      dex.fee.toString(),
      dex.burn.toString(),
      dex.includeSibsidy
    );
    return parseFloat(result.toString());
  }

  tokenToXtzExchangeRateDisplay(tokenToSell: Amount, xtzPool: Amount, tokenPool: Amount, dex): string {
    const token = tokenToSell.internalBigInt;
    const xPool = xtzPool.internalBigInt;
    const tPool = tokenPool.internalBigInt;

    const result = dexterCalculations.tokenToXtzExchangeRateForDisplay(
      token.toString(),
      xPool.toString(),
      tPool.toString(),
      tokenPool.decimalPlaces,
      dex.fee.toString(),
      dex.burn.toString(),
      dex.includeSibsidy
    );
    return result?.toString() ?? '0';
  }

  tokenToXtzMarketRate(xtzPool: Amount, tokenPool: Amount): number {
    const xPool = xtzPool.internalBigInt;
    const tPool = tokenPool.internalBigInt;

    const result = dexterCalculations.tokenToXtzMarketRate(xPool, tPool, tokenPool.decimalPlaces);
    return parseFloat(parseFloat(result.toString()).toFixed(tokenPool.decimalPlaces));
  }

  tokenToXtzPriceImpact(tokenToSell: Amount, xtzPool: Amount, tokenPool: Amount, dex): number {
    const token = tokenToSell.internalBigInt;
    const xtzPoolRpc = xtzPool.internalBigInt;
    const tokenPoolRpc = tokenPool.internalBigInt;

    const result = dexterCalculations.tokenToXtzPriceImpact(
      token.toString(),
      xtzPoolRpc.toString(),
      tokenPoolRpc.toString(),
      dex.fee.toString(),
      dex.burn.toString(),
      dex.includeSibsidy
    );
    return parseFloat(result?.toString() ?? 0);
  }

  addLiquidityReturn(xtzToDeposit: Amount, xtzPool: Amount, totalLiquidity: Amount, slippage: number, dex): { expected: Amount; minimum: Amount } {
    if (slippage < 0 || slippage > 1) {
      console.log(`slippage value supplied to 'addLiquidityReturn' was not between 0 and 1: ${slippage}`);
      return undefined;
    }

    const xtzIn = xtzToDeposit.internalBigInt;
    const xPool = xtzPool.internalBigInt;
    const totalLqt = totalLiquidity;

    const result = dexterCalculations.addLiquidityLiquidityCreated(xtzIn.toString(), xPool.toString(), totalLqt.toString(), dex.includeSubsidy);
    const expected = new Amount({
      rpcAmount: result?.value ?? 0,
      decimalPlaces: 0
    });
    const minimum = expected.internalNormalised - expected.internalNormalised * slippage;
    const minAmount = new Amount({
      normalisedAmount: minimum ?? 0,
      decimalPlaces: 0
    });
    return { expected, minimum: minAmount };
  }

  addLiquidityTokenRequired(xtzToDeposit: Amount, xtzPool: Amount, tokenPool: Amount, dex): Amount {
    const xtzIn = xtzToDeposit.internalBigInt;
    const xPool = xtzPool.internalBigInt;
    const tPool = tokenPool.internalBigInt;

    const result = dexterCalculations.addLiquidityTokenIn(xtzIn.toString(), xPool.toString(), tPool.toString(), dex.includeSubsidy);
    return new Amount({
      rpcAmount: result?.toString() ?? '0',
      decimalPlaces: tokenPool.decimalPlaces
    });
  }

  addLiquidityXtzRequired(tokenToDeposit: Amount, xtzPool: Amount, tokenPool: Amount, dex): Amount {
    const tokenIn = tokenToDeposit.internalBigInt;
    const xPool = xtzPool.internalBigInt;
    const tPool = tokenPool.internalBigInt;

    const result = dexterCalculations.addLiquidityXtzIn(tokenIn.toString(), xPool.toString(), tPool.toString(), dex.includeSubsidy);
    return new Amount({ rpcAmount: result?.toString() ?? '0', decimalPlaces: xtzPool.decimalPlaces });
  }

  removeLiquidityTokenReceived(liquidityBurned: Amount, totalLiquidity: Amount, tokenPool: Amount, slippage: number): { expected: Amount; minimum: Amount } {
    if (slippage < 0 || slippage > 1) {
      console.log(`slippage value supplied to 'removeLiquidityTokenReceived' was not between 0 and 1: ${slippage}`);
      return undefined;
    }

    const lqtBurned = liquidityBurned.internalBigInt;
    const tLqt = totalLiquidity;
    const tPool = tokenPool.internalBigInt;

    const result = dexterCalculations.removeLiquidityTokenOut(lqtBurned.toString(), tLqt.toString(), tPool.toString());

    if (!!Big(result?.value).toString()) {
      const expected = new Amount({
        rpcAmount: result?.value ?? 0,
        decimalPlaces: 8
      });
      const minimum = expected.internalNormalised - expected.internalNormalised * slippage;
      const minAmount = new Amount({
        normalisedAmount: minimum,
        decimalPlaces: 8
      });
      return { expected, minimum: minAmount };
    } else {
      return undefined;
    }
  }

  removeLiquidityXtzReceived(liquidityBurned: Amount, totalLiquidity: Amount, xtzPool: Amount, slippage: number, dex): { expected: Amount; minimum: Amount } {
    if (slippage < 0 || slippage > 1) {
      console.log(`slippage value supplied to 'removeLiquidityXtzReceived' was not between 0 and 1: ${slippage}`);
      return undefined;
    }

    const lqtBurned = liquidityBurned.internalBigInt;
    const tLqt = totalLiquidity;
    const xPool = xtzPool.internalBigInt;

    const result = dexterCalculations.removeLiquidityXtzOut(lqtBurned.toString(), tLqt.toString(), xPool.toString(), dex.includeSubsidy);

    if (!!Big(result?.value).toString()) {
      const expected = new Amount({
        rpcAmount: result?.value,
        decimalPlaces: 6
      });
      const minimum = expected.internalNormalised - expected.internalNormalised * slippage;
      const minAmount = new Amount({
        normalisedAmount: minimum,
        decimalPlaces: 6
      });
      return { expected, minimum: minAmount };
    } else {
      return undefined;
    }
  }
  estimateLiquidityBakingAPY() {
    return 'APY: ' + dexterCalculations.estimateLiquidityBakingAPY(this.storage[this.lqdContract]?.tez_pool).toFixed(2) + '%';
  }
}
