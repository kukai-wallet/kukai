import { Injectable } from '@angular/core';
import { ChartSeries } from '../../../app/components/ui/chart/chart.component';
import { SwapLiquidityService } from '../swap-liquidity/swap-liquidity.service';

export enum ChartTitle {
  XTZtzBTC = 'XTZ/tzBTC',
  tzBTCXTZ = 'tzBTC/XTZ',
  totalValueLocked = 'Total Value Locked'
}

let width, height, gradient;
function getGradientBackground(ctx, chartArea) {
  const style = getComputedStyle(document.body);
  const theme = style.getPropertyValue('--theme').replace(/[ \"]/g, '');
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (gradient === null || width !== chartWidth || height !== chartHeight) {
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    if (theme === 'dark') {
      gradient.addColorStop(1, '#383d7d');
      gradient.addColorStop(0.5, '#2e304f');
      gradient.addColorStop(0, '#2a2c3f');
    } else {
      gradient.addColorStop(1, '#c2c5fc');
      gradient.addColorStop(0.5, '#e0e1fb');
      gradient.addColorStop(0, '#e8eafb');
    }
  }

  return gradient;
}

@Injectable({ providedIn: 'root' })
export class ChartService {
  ChartTitle = ChartTitle;
  stats = null;
  constructor(private swapLiquidityService: SwapLiquidityService) {}

  async fetchLBGraphData(series: ChartSeries = ChartSeries.day): Promise<{ labels: any[]; datasets: any[] }> {
    let tzbtc = await this.fetchHistoricalQuotesByContract(this.swapLiquidityService.tzBTCContract + '_0', series);
    let stats = (this.stats = !this.stats ? await this.fetchHistoricalStatsByContract(this.swapLiquidityService.lqdContract, series) : this.stats);
    let interval = 1000 * 60 * 60 * 24;
    const a = [];
    const b = [];
    const d = [];
    const labels = [];
    let now = new Date().getTime();
    if (series === ChartSeries.month) {
      interval = 1000 * 60 * 60 * 24;
      tzbtc = tzbtc.slice(0, 32);
      stats = stats.slice(0, 32);
    } else if (series === ChartSeries.day) {
      interval = 1000 * 60 * 60;
      tzbtc = tzbtc.slice(0, 25);
      stats = stats.slice(0, 25);
    } else if (series === ChartSeries.week) {
      interval = 1000 * 60 * 60 * 4;
      tzbtc = tzbtc.slice(0, 7 * 24).filter((e, i) => i % 4 === 0);
      stats = stats.slice(0, 7 * 24).filter((e, i) => i % 4 === 0);
    } else if (series === ChartSeries.year) {
      interval = 1000 * 60 * 60 * 24 * 31;
      tzbtc = tzbtc.slice(0, 365).filter((e, i) => i % 31 === 0);
      stats = stats.slice(0, 365).filter((e, i) => i % 31 === 0);
    }
    tzbtc = tzbtc.reverse();
    stats = stats.reverse();
    for (let i = 0; i < tzbtc.length; ++i) {
      a.push(1 / parseFloat(tzbtc[i].close));
      b.push(parseFloat(tzbtc[i].close));
      if (stats[i]?.tvlUsd) {
        d.push(parseFloat(stats[i].tvlUsd));
      }
      const c = new Date((now -= interval));
      if (series === ChartSeries.month) {
        labels.push(c.toLocaleString('en-US', { month: 'short' }) + ' ' + c.getDate());
      } else if (series === ChartSeries.day) {
        labels.push('' + c.getHours() + ':00');
      } else if (series === ChartSeries.week) {
        labels.push(c.toLocaleString('en-US', { month: 'short' }) + ' ' + c.getDate() + ' ' + (c.getHours() + 1) + ':00');
      } else if (series === ChartSeries.year) {
        labels.push(c.toLocaleString('en-US', { month: 'short' }) + ' ' + c.getDate());
      }
    }
    const defaultDatasetValues = {
      hidden: true,
      backgroundColor: function (context) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;

        if (!chartArea) {
          return null;
        }
        return getGradientBackground(ctx, chartArea);
      },
      borderColor: '#5963ff88',
      borderRadius: 1,
      borderWidth: 3,
      pointBorderWidth: 0,
      pointBackgroundColor: '#5963ff88',
      pointBorderColor: '#5963ff88',
      pointRadius: 0,
      pointHoverBorderWidth: 6,
      pointHoverColor: '#5963ff88',
      pointHitRadius: 6,
      fill: true
    };
    const datasets = [
      {
        label: ChartTitle.XTZtzBTC,
        data: a,
        ...defaultDatasetValues
      },
      {
        label: ChartTitle.tzBTCXTZ,
        data: b,
        ...defaultDatasetValues
      },
      {
        label: ChartTitle.totalValueLocked,
        data: d,
        ...defaultDatasetValues
      }
    ];
    return { datasets, labels: labels.reverse() };
  }

  async fetchHistoricalQuotesByContract(
    contract: string = 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5',
    series: ChartSeries = ChartSeries.day,
    offset: number = 0
  ): Promise<any> {
    const baseUrl = `https://dex.dipdup.net/v1/graphql`;
    let req;
    if (series === ChartSeries.month || series === ChartSeries.year) {
      req = {
        query: `{quotes1d(offset: ${offset} limit: 100 where: {exchangeId:{_eq: "${this.swapLiquidityService.lqdContract}"} tokenId: {_eq: "${contract}"}, close: {_is_null: false}}) { close }}`
      };
    } else if (series === ChartSeries.day || series === ChartSeries.week) {
      req = {
        query: `{quotes1h(offset: ${offset} limit: 100 where: {exchangeId:{_eq: "${this.swapLiquidityService.lqdContract}"} tokenId: {_eq: "${contract}"}, close: {_is_null: false}}) { close }}`
      };
    }
    try {
      let result = await (
        await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req)
        })
      ).json();
      if (series === ChartSeries.week) {
        if (result.data?.quotes1h.length === 100) {
          result = result?.data?.quotes1h;
          offset += 100;
          return result.concat(await this.fetchHistoricalQuotesByContract(this.swapLiquidityService.tzBTCContract + '_0', series, offset));
        } else {
          return result?.data?.quotes1h;
        }
      }
      if (series === ChartSeries.month) {
        return result?.data?.quotes1d;
      } else if (series === ChartSeries.day) {
        return result?.data?.quotes1h;
      } else if (series === ChartSeries.year) {
        if (result.data?.quotes1d.length === 100) {
          result = result?.data?.quotes1d;
          offset += 100;
          return result.concat(await this.fetchHistoricalQuotesByContract(this.swapLiquidityService.tzBTCContract + '_0', series, offset));
        } else {
          return result?.data?.quotes1d;
        }
      }
    } catch (e) {
      return [];
    }
  }

  async fetchHistoricalStatsByContract(
    contract: string = 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5',
    series: string = 'day',
    offset: number = 0
  ): Promise<Array<any>> {
    const baseUrl = `https://dex.dipdup.net/v1/graphql`;
    let req;
    if (series === 'day') {
      req = {
        query: `{  stats1d(
        where: {exchangeId: {_eq: "${contract}"}, bucket: {_is_null: false}, tvlUsd: {_is_null: false}}
      ) {
        bucket
        exchangeId
        interactions
        sharePx
        sharePxBtc
        sharePxUsd
        tvl
        tvlBtc
        tvlUsd
        users
      }}`
      };
    } else if (series === 'week') {
      req = {
        query: `{  stats1d(
        where: {exchangeId: {_eq: "${contract}"}, bucket: {_is_null: false}, tvlUsd: {_is_null: false}}
      ) {
        bucket
        exchangeId
        interactions
        sharePx
        sharePxBtc
        sharePxUsd
        tvl
        tvlBtc
        tvlUsd
        users
      }}`
      };
    } else if (series === 'month') {
      req = {
        query: `{  stats1d(
        where: {exchangeId: {_eq: "${contract}"}, bucket: {_is_null: false}, tvlUsd: {_is_null: false}}
      ) {
        bucket
        exchangeId
        interactions
        sharePx
        sharePxBtc
        sharePxUsd
        tvl
        tvlBtc
        tvlUsd
        users
      }}`
      };
    } else if (series === 'year') {
      req = {
        query: `{  stats1d(
        where: {exchangeId: {_eq: "${contract}"}, bucket: {_is_null: false}, tvlUsd: {_is_null: false}}
      ) {
        bucket
        exchangeId
        interactions
        sharePx
        sharePxBtc
        sharePxUsd
        tvl
        tvlBtc
        tvlUsd
        users
      }}`
      };
    }
    try {
      let result = await (
        await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req)
        })
      ).json();
      if (series === ChartSeries.week) {
        if (result.data?.stats1d.length === 100) {
          result = result?.data?.stats1d;
          offset += 100;
          return result.concat(await this.fetchHistoricalStatsByContract(this.swapLiquidityService.tzBTCContract + '_0', series, offset));
        } else {
          return result?.data?.stats1d;
        }
      }
      if (series === ChartSeries.month) {
        return result?.data?.stats1d;
      } else if (series === ChartSeries.day) {
        return result?.data?.stats1d;
      } else if (series === ChartSeries.year) {
        return result?.data?.stats1d;
      }
    } catch {
      return [];
    }
  }
}
