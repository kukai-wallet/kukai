import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { FullyPreparedTransaction, PartiallyPreparedTransaction, LqdEntrypoints } from '../../misc/send/interfaces';
import { EstimateService } from '../../../services/estimate/estimate.service';
import { SubjectService } from '../../../services/subject/subject.service';
import { TezosDomainsService } from '../../../services/tezos-domains/tezos-domains.service';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';
import { TokenService } from '../../../services/token/token.service';
import { WalletService } from '../../../services/wallet/wallet.service';
import { SwapLiquidityService } from '../../../services/swap-liquidity/swap-liquidity.service';
import { Amount } from '../../../services/swap-liquidity/classes/Amount';
import { ModalComponent } from '../modal.component';
import { OperationService } from '../../../services/operation/operation.service';
import { DefaultTransactionParams } from '../../../interfaces';
import Big from 'big.js';
import { Account } from '../../../services/wallet/wallet';
import assert from 'assert';
import { TranslateService } from '@ngx-translate/core';
import { InputValidationService } from '../../../services/input-validation/input-validation.service';
import { TorusService } from '../../../services/torus/torus.service';
import { MessageService } from '../../../services/message/message.service';
import { take } from 'rxjs/operators';
import { ChartComponent, ChartSeries } from '../../ui/chart/chart.component';
import { ChartData } from 'chart.js';
import { ChartService, ChartTitle } from '../../../services/chart/chart.service';

enum Mode {
  swap = 'swap',
  liquidity = 'liquidity'
}

const zeroTxParams: DefaultTransactionParams = {
  gas: 0,
  storage: 0,
  fee: 0,
  burn: 0
};

@Component({
  selector: 'app-swap-liquidity',
  templateUrl: './swap-liquidity.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class SwapLiquidityComponent extends ModalComponent {
  @ViewChild('leftChart') leftChart: ChartComponent;
  @ViewChild('miniChart') miniChart: ChartComponent;
  @Output() prepareResponse = new EventEmitter();
  LqdEntrypoints = LqdEntrypoints;
  Mode = Mode;
  Object = Object;
  mode = Mode.swap;
  entrypoint: string = LqdEntrypoints.xtzToToken;
  advancedForm = false;

  defaultTransactionParams: DefaultTransactionParams = zeroTxParams;

  readonly lqdTokenContract = 'KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo';
  readonly lqdContract = 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5';
  readonly tzBTCContract = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn';

  readonly costPerByte: string = this.estimateService.costPerByte;

  moreInfo = false;

  formInvalid = '';
  latestSimError = '';

  customFee = '';
  customGasLimit = '';
  customStorageLimit = '';

  minimumLqd: Amount = null;
  minimumXtz: Amount = null;
  minimumToken: Amount = null;
  xtzRequired: Amount = null;
  expectedRate: string;
  impactDouble: number;
  qty: Amount = new Amount({
    normalisedAmount: '',
    decimalPlaces: 6
  });
  qtyRaw = '';
  qtyOut: Amount = new Amount({
    normalisedAmount: '',
    decimalPlaces: 8
  });
  qtyRawOut = '';
  slippage = 0.005;

  xtzBalance = '0';
  lqdBalance = '0';
  tzBTCBalance = '0';

  activeAccount = null;
  transactions: PartiallyPreparedTransaction[] = [];

  balances: any[];
  name = 'swap-liquidity';

  private subscriptions: Subscription = new Subscription();
  simSemaphore = 0;

  tooltipValue: string = '--';
  titleColor = '#333';
  series = 'day';
  units = 'tzBTC';
  attributes: any = {};
  chartData: ChartData;
  chartDatas: Array<ChartData> = [];
  chartOptions = null;
  popoutOptions: any;
  chartInit = false;

  constructor(
    public tokenService: TokenService,
    public walletService: WalletService,
    private estimateService: EstimateService,
    public tezosDomainService: TezosDomainsService,
    public tokenBalancesService: TokenBalancesService,
    private subjectService: SubjectService,
    private swapLiquidityService: SwapLiquidityService,
    private operationService: OperationService,
    public torusService: TorusService,
    private translate: TranslateService,
    public tezosDomains: TezosDomainsService,
    private inputValidationService: InputValidationService,
    private messageService: MessageService,
    private chartService: ChartService
  ) {
    super();
    const setTokenBalances = () => {
      this.xtzBalance = Big(this.activeAccount?.availableBalance ?? 0)
        .div(10 ** 6)
        .toString();
      this.lqdBalance = this.balances.find((b) => b.contractAddress === this.lqdTokenContract && b.id == 0)?.balance ?? '0';
      this.tzBTCBalance = this.balances.find((b) => b.contractAddress === this.tzBTCContract && b.id == 0)?.balance ?? '0';
    };
    this.subscriptions.add(
      this.subjectService.activeAccount.subscribe((activeAccount) => {
        if (!!activeAccount) {
          this.activeAccount = activeAccount;
          this.balances = this.tokenBalancesService?.balances;
          setTokenBalances();
        }
      })
    );
    this.subscriptions.add(
      this.subjectService.nftsUpdated.subscribe((p) => {
        this.balances = p?.balances ?? this.tokenBalancesService?.balances;
        setTokenBalances();
      })
    );
    this.subscriptions.add(
      this.subjectService.walletUpdated.subscribe(() => {
        this.balances = this.tokenBalancesService?.balances;
        setTokenBalances();
      })
    );
  }

  async initChartsMobile(): Promise<void> {
    Promise.all([
      this.chartService.fetchLBGraphData(ChartSeries.day),
      this.chartService.fetchLBGraphData(ChartSeries.week),
      this.chartService.fetchLBGraphData(ChartSeries.month),
      this.chartService.fetchLBGraphData(ChartSeries.year)
    ]).then((arr) => {
      this.chartDatas[ChartSeries.day] = arr[0];
      this.chartDatas[ChartSeries.week] = arr[1];
      this.chartDatas[ChartSeries.month] = arr[2];
      this.chartDatas[ChartSeries.year] = arr[3];
      //prevents race cond
      if (this.entrypoint === LqdEntrypoints.xtzToToken) {
        this.leftChart?.toggleSet(ChartTitle.XTZtzBTC);
        this.miniChart?.toggleSet(ChartTitle.XTZtzBTC);
      } else if (this.entrypoint === LqdEntrypoints.tokenToXtz) {
        this.leftChart?.toggleSet(ChartTitle.tzBTCXTZ);
        this.miniChart?.toggleSet(ChartTitle.tzBTCXTZ);
      } else if (this.entrypoint === LqdEntrypoints.addLiquidity || this.entrypoint === LqdEntrypoints.removeLiquidity) {
        this.leftChart?.toggleSet(ChartTitle.totalValueLocked);
        this.miniChart?.toggleSet(ChartTitle.totalValueLocked);
      }
      this.leftChart?.toggleSeries(ChartSeries.day);
      this.miniChart?.toggleSeries(ChartSeries.week);
    });
  }

  async initChartsDesktop(): Promise<void> {
    Promise.all([
      this.chartService.fetchLBGraphData(ChartSeries.day),
      this.chartService.fetchLBGraphData(ChartSeries.week),
      this.chartService.fetchLBGraphData(ChartSeries.month),
      this.chartService.fetchLBGraphData(ChartSeries.year)
    ]).then((arr) => {
      this.chartDatas[ChartSeries.day] = arr[0];
      this.chartDatas[ChartSeries.week] = arr[1];
      this.chartDatas[ChartSeries.month] = arr[2];
      this.chartDatas[ChartSeries.year] = arr[3];
      //prevents race cond
      if (this.entrypoint === LqdEntrypoints.xtzToToken) {
        this.leftChart?.toggleSet(ChartTitle.XTZtzBTC);
        this.leftChart?.toggleSeries(ChartSeries.day);
      } else if (this.entrypoint === LqdEntrypoints.tokenToXtz) {
        this.leftChart?.toggleSet(ChartTitle.tzBTCXTZ);
        this.leftChart?.toggleSeries(ChartSeries.day);
      } else if (this.entrypoint === LqdEntrypoints.addLiquidity || this.entrypoint === LqdEntrypoints.removeLiquidity) {
        this.leftChart?.toggleSet(ChartTitle.totalValueLocked);
        this.leftChart?.toggleSeries(ChartSeries.month);
      }
    });
  }

  async initCharts(): Promise<void> {
    const isMobile = document.documentElement.style.getPropertyValue('--is-mobile');
    const style = getComputedStyle(document.body);
    this.titleColor = style.getPropertyValue('--base-font-color');
    if (isMobile === '1') {
      await this.initChartsMobile();
    } else {
      await this.initChartsDesktop();
    }
  }

  birthExchangeRate(): void {
    let qty = new Amount({
      normalisedAmount: 1,
      decimalPlaces: 6
    });
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const rate = this.swapLiquidityService.xtzToTokenExchangeRateDisplay(qty, xtzPool, tokenPool, this.swapLiquidityService.settings('liquidityBaking'));
    this.expectedRate = `1 XTZ ($${this.walletService?.wallet?.XTZrate.toFixed(2)}) = ${Big(rate).toFixed(tokenPool.decimalPlaces)} tzBTC`;
  }

  async init(): Promise<boolean> {
    this.qtyRaw = '';
    this.qty = new Amount({
      normalisedAmount: 0,
      decimalPlaces: 6
    });
    this.balances = this.tokenBalancesService?.balances;
    const r = await this.hydratePools();
    this.attributes = { APY: this.swapLiquidityService.estimateLiquidityBakingAPY() };
    this.initCharts();
    this.birthExchangeRate();
    return r;
  }

  async open(): Promise<void> {
    this.subjectService.activeAccount.pipe(take(1)).subscribe(async (activeAccount) => {
      this.activeAccount = activeAccount;
      await this.estimateService.preLoadData(this.activeAccount.pkh, this.activeAccount.pk);
      if (await this.init()) {
        super.open();
      }
      this.messageService.stopSpinner();
    });
  }

  close(): void {
    this.reset();
    this.mode = Mode.swap;
    this.entrypoint = LqdEntrypoints.xtzToToken;
    this.chartInit = false;
    super.close();
  }

  calculateXtzToToken(): void {
    this.qty = new Amount({
      normalisedAmount: parseFloat(this.qtyRaw),
      decimalPlaces: 6
    });
    this.qtyOut = new Amount({
      normalisedAmount: parseFloat(this.qtyRawOut),
      decimalPlaces: 8
    });
    const xtzToSell = this.qty;
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const result = this.swapLiquidityService.calculateXtzToToken(
      xtzToSell,
      xtzPool,
      tokenPool,
      this.slippage,
      this.swapLiquidityService.settings('liquidityBaking')
    );
    this.minimumToken = result.minimum;
    this.expectedRate = `1 XTZ ($${this.walletService?.wallet?.XTZrate.toFixed(2)}) = ${Big(result.rate).toFixed(tokenPool.decimalPlaces)} tzBTC`;
    this.impactDouble = result.impactDouble;
    this.qtyOut = result.expected;
    this.qtyRawOut = result.expected?.internalNormalised.toFixed(result.expected?.decimalPlaces).toString();
  }

  calculateTokenToXTZFromXTZ(): void {
    this.qty = new Amount({
      normalisedAmount: parseFloat(this.qtyRaw),
      decimalPlaces: 8
    });
    this.qtyOut = new Amount({
      normalisedAmount: parseFloat(this.qtyRawOut),
      decimalPlaces: 6
    });
    const xtzToBuy = this.qtyOut;
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const result = this.swapLiquidityService.calculateTokenToXTZFromXTZ(
      xtzToBuy,
      xtzPool,
      tokenPool,
      this.slippage,
      this.swapLiquidityService.settings('liquidityBaking')
    );
    this.minimumXtz = result.xtz.minimum;
    this.expectedRate = `1 tzBTC ($${Big(result.xtz.rate).times(this.walletService?.wallet?.XTZrate).toFixed(2)}) = ${Big(result.xtz.rate).toFixed(
      xtzPool.decimalPlaces
    )} XTZ`;
    this.impactDouble = result.xtz.impactDouble;
    this.qty = result.token.expected;
    this.qtyRaw = result.token.expected?.internalNormalised.toFixed(result.token.expected?.decimalPlaces).toString();
  }

  calculateTokenToXTZ(): void {
    this.qty = new Amount({
      normalisedAmount: parseFloat(this.qtyRaw),
      decimalPlaces: 8
    });
    this.qtyOut = new Amount({
      normalisedAmount: parseFloat(this.qtyRawOut),
      decimalPlaces: 6
    });
    const tokenToSell = this.qty;
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const result = this.swapLiquidityService.calculateTokenToXTZ(
      tokenToSell,
      xtzPool,
      tokenPool,
      this.slippage,
      this.swapLiquidityService.settings('liquidityBaking')
    );
    this.minimumXtz = result.minimum;
    this.expectedRate = `1 tzBTC ($${Big(result.rate).times(this.walletService?.wallet?.XTZrate).toFixed(2)}) = ${Big(result.rate).toFixed(
      xtzPool.decimalPlaces
    )} XTZ`;
    this.impactDouble = result.impactDouble;
    this.qtyOut = result.expected;
    this.qtyRawOut = result.expected?.internalNormalised.toFixed(result.expected?.decimalPlaces).toString();
  }

  calculateXtzToTokenFromToken(): void {
    this.qty = new Amount({
      normalisedAmount: parseFloat(this.qtyRaw),
      decimalPlaces: 6
    });
    this.qtyOut = new Amount({
      normalisedAmount: parseFloat(this.qtyRawOut),
      decimalPlaces: 8
    });
    const tokenToBuy = this.qtyOut;
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const result = this.swapLiquidityService.calculateXtzToTokenFromToken(
      tokenToBuy,
      xtzPool,
      tokenPool,
      this.slippage,
      this.swapLiquidityService.settings('liquidityBaking')
    );
    this.minimumToken = result.token.minimum;
    this.expectedRate = `1 XTZ ($${this.walletService?.wallet?.XTZrate.toFixed(2)}) = ${Big(result.token.rate).toFixed(tokenPool.decimalPlaces)} tzBTC`;
    this.impactDouble = result.token.impactDouble;
    this.qty = result.xtz.expected;
    this.qtyRaw = result.xtz.expected?.internalNormalised.toFixed(result.xtz.expected?.decimalPlaces).toString();
  }

  calcSwap(type: string = 'qtyRaw'): void {
    if (type === 'qtyRaw' && this.entrypoint === LqdEntrypoints.xtzToToken) {
      this.calculateXtzToToken();
    } else if (type === 'qtyRawOut' && this.entrypoint === LqdEntrypoints.tokenToXtz) {
      this.calculateTokenToXTZFromXTZ();
    } else if (type === 'qtyRaw' && this.entrypoint === LqdEntrypoints.tokenToXtz) {
      this.calculateTokenToXTZ();
    } else if (type === 'qtyRawOut' && this.entrypoint === LqdEntrypoints.xtzToToken) {
      this.calculateXtzToTokenFromToken();
    }
  }

  calcAddLiquidity(type: string): void {
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    if (type === 'qtyRaw') {
      const toSell = this.qty;
      const result = this.swapLiquidityService.calculateAddLiquidityXTZ(
        toSell,
        xtzPool,
        tokenPool,
        parseFloat(this.swapLiquidityService.storage[this.lqdContract]?.total_pool),
        this.slippage,
        this.swapLiquidityService.settings('liquidityBaking')
      );
      this.minimumLqd = result.liquidityMinimum;
      this.qtyOut = result.tokenRequired;
      this.qtyRawOut = result.tokenRequired?.internalNormalised.toFixed(result.tokenRequired?.decimalPlaces).toString();
      this.expectedRate = `1 XTZ ($${this.walletService?.wallet?.XTZrate.toFixed(2)}) = ${Big(result.exchangeRate).toFixed(tokenPool.decimalPlaces)} tzBTC`;
    } else {
      const toSell = this.qtyOut;
      const result = this.swapLiquidityService.calculateAddLiquidityToken(
        toSell,
        xtzPool,
        tokenPool,
        parseFloat(this.swapLiquidityService.storage[this.lqdContract]?.total_pool),
        this.slippage,
        this.swapLiquidityService.settings('liquidityBaking')
      );
      this.minimumLqd = result.liquidityMinimum;
      this.qty = this.xtzRequired = result.xtzRequired;
      this.qtyRaw = result.xtzRequired?.internalNormalised.toFixed(result.xtzRequired?.decimalPlaces).toString();
      this.expectedRate = `1 XTZ ($${this.walletService?.wallet?.XTZrate.toFixed(2)}) = ${Big(result.exchangeRate).toFixed(tokenPool.decimalPlaces)} tzBTC`;
    }
  }

  calcRemoveLiquidity(): void {
    const lqtToBurn = this.qty;
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const result = this.swapLiquidityService.calculateRemoveLiquidity(
      lqtToBurn,
      xtzPool,
      tokenPool,
      parseFloat(this.swapLiquidityService.storage[this.lqdContract]?.total_pool),
      this.slippage,
      this.swapLiquidityService.settings('liquidityBaking')
    );
    this.minimumXtz = result.xtzMinimum;
    this.minimumToken = result.tokenMinimum;
  }

  reset(): void {
    this.minimumLqd = null;
    this.minimumXtz = null;
    this.minimumToken = null;
    this.expectedRate = '';
    this.impactDouble = undefined;
    this.xtzRequired = null;

    this.qty = new Amount({
      normalisedAmount: '',
      decimalPlaces: 6
    });
    this.qtyRaw = '';
    this.qtyOut = new Amount({
      normalisedAmount: '',
      decimalPlaces: 8
    });
    this.qtyRawOut = '';

    this.advancedForm = false;
    this.customFee = '';
    this.customGasLimit = '';
    this.customStorageLimit = '';
    this.defaultTransactionParams = zeroTxParams;
    this.formInvalid = '';
    this.latestSimError = '';

    this.slippage = 0.005;
    this.transactions = [];

    this.moreInfo = false;
  }
  async hydratePools(): Promise<boolean> {
    try {
      await this.swapLiquidityService.fetchStorage(this.lqdContract);
    } catch (e) {
      this.messageService.addError(this.translate.instant('SWAPCOMPONENT.CONTRACTSTORAGEFAILED'));
      return false;
    }
    return true;
  }

  async update(type: string = 'qtyRaw'): Promise<void> {
    this.xtzBalance = Big(this.activeAccount?.availableBalance ?? 0)
      .div(10 ** 6)
      .toString();
    this.lqdBalance = this.balances.find((b) => b.contractAddress === this.lqdTokenContract && b.id == 0)?.balance ?? '0';
    this.tzBTCBalance = this.balances.find((b) => b.contractAddress === this.tzBTCContract && b.id == 0)?.balance ?? '0';
    if (this.entrypoint === LqdEntrypoints.xtzToToken || this.entrypoint === LqdEntrypoints.tokenToXtz) {
      this.calcSwap(type);
    } else if (this.entrypoint === LqdEntrypoints.addLiquidity) {
      this.qty = new Amount({
        normalisedAmount: parseFloat(this.qtyRaw),
        decimalPlaces: 6
      });
      this.qtyOut = new Amount({
        normalisedAmount: parseFloat(this.qtyRawOut),
        decimalPlaces: 8
      });
      this.calcAddLiquidity(type);
    } else if (this.entrypoint === LqdEntrypoints.removeLiquidity) {
      this.qty = new Amount({
        normalisedAmount: parseFloat(this.qtyRaw),
        decimalPlaces: 0
      });
      this.qtyOut = new Amount({
        normalisedAmount: parseFloat(this.qtyRawOut),
        decimalPlaces: 0
      });
      this.calcRemoveLiquidity();
    }
    if (this.qty && this.qty.internalNormalised) {
      this.estimateFees();
    }
  }

  preview(): void {
    if (!this.qtyRaw) {
      return;
    }
    try {
      this.prepareResponse.emit(this.getFullyPreparedTxs());
      ModalComponent.currentModel.next({ name: '', data: {} });
      this.reset();
    } catch (e) {
      this.formInvalid = e.message;
    }
  }
  toggleMode(mode): void {
    if (mode === this.mode) {
      return;
    }
    this.reset();
    const chartToggle = (label) => {
      const style = getComputedStyle(document.body);
      this.titleColor = style.getPropertyValue('--base-font-color');
      this.miniChart.toggleSet(label);
      this.leftChart.toggleSet(label);
      if (label === ChartTitle.totalValueLocked) {
        this.miniChart.toggleSeries(ChartSeries.month);
        this.leftChart.toggleSeries(ChartSeries.month);
      } else {
        this.miniChart.toggleSeries(ChartSeries.week);
        this.leftChart.toggleSeries(ChartSeries.day);
      }
    };
    if (mode === Mode.swap) {
      this.mode = Mode.swap;
      this.entrypoint = LqdEntrypoints.xtzToToken;
      chartToggle(ChartTitle.XTZtzBTC);
    } else if (mode === Mode.liquidity) {
      this.mode = Mode.liquidity;
      this.entrypoint = LqdEntrypoints.addLiquidity;
      chartToggle(ChartTitle.totalValueLocked);
    }
    this.qty = new Amount({
      normalisedAmount: 0,
      decimalPlaces: 6
    });
    this.birthExchangeRate();
  }
  toggleDirection(dir): void {
    if (this.mode === 'swap') {
      const chartToggle = (label) => {
        const style = getComputedStyle(document.body);
        this.titleColor = style.getPropertyValue('--base-font-color');
        this.leftChart.toggleSet(label);
        this.miniChart.toggleSet(label);
        this.miniChart.toggleSeries(ChartSeries.week);
      };
      this.qtyRaw = this.qtyRawOut;
      if (this.entrypoint === LqdEntrypoints.tokenToXtz) {
        this.entrypoint = LqdEntrypoints.xtzToToken;
        chartToggle(ChartTitle.XTZtzBTC);
      } else if (this.entrypoint === LqdEntrypoints.xtzToToken) {
        this.entrypoint = LqdEntrypoints.tokenToXtz;
        chartToggle(ChartTitle.tzBTCXTZ);
      }
      this.evalAmount();
    } else {
      if (dir === 0 && this.entrypoint !== LqdEntrypoints.addLiquidity) {
        this.reset();
        this.entrypoint = LqdEntrypoints.addLiquidity;
        this.qty = new Amount({
          normalisedAmount: parseFloat(this.qtyRaw),
          decimalPlaces: 6
        });
      } else if (dir === 1 && this.entrypoint !== LqdEntrypoints.removeLiquidity) {
        this.reset();
        this.entrypoint = LqdEntrypoints.removeLiquidity;
        this.qty = new Amount({
          normalisedAmount: parseFloat(this.qtyRaw),
          decimalPlaces: 0
        });
      }
      this.birthExchangeRate();
    }
  }
  getTotalFee(): number {
    if (this.customFee !== '' && Number(this.customFee)) {
      return Number(this.customFee);
    }
    return Number(this.defaultTransactionParams.fee);
  }
  getTotalBurn(): number {
    if (this.customStorageLimit !== '' && Number(this.customStorageLimit)) {
      return Number(Big(this.customStorageLimit).mul(this.transactions.length).times(this.costPerByte).div(1000000).toString());
    }
    return this.defaultTransactionParams.burn;
  }
  burnAmount(): string {
    const burn = this.customStorageLimit ? Number(Big(this.customStorageLimit).times(this.costPerByte).div(1000000)) : this.defaultTransactionParams.burn;
    if (burn) {
      return burn + ' tez';
    }
    return '';
  }
  customSlippage(e): void {
    e.target.value = e.target.value.replace(/[^0-9\.]+/g, '');
    this.slippage = Math.max(Math.min(100, parseFloat(e.target.value || 0) / 100.0), 0);
    // this.slippageInput.nativeElement.value = this.slippage;
    this.update();
  }
  customSlippageFocus(e): void {
    if (e.target.value !== '') {
      e.target.value = e.target.value.replace(/[^0-9\.]+/g, '');
      this.slippage = Math.max(Math.min(100, parseFloat(e.target.value || 0) / 100.0), 0);
      this.update();
    }
  }
  customSlippageBlur(e): void {
    if (!Number.isNaN(Number(e.target.value)) && e.target.value !== '') {
      e.target.value = Math.max(Math.min(100, e.target.value), 0);
    } else {
      e.target.value = '';
      this.slippage = 0.005;
      this.update();
    }
  }
  getMaxAmount(account: Account): { tez; lqd; tzBTC } {
    if (account) {
      let accountBalance = Big(this.xtzBalance);
      accountBalance = accountBalance.minus(this.customFee && Number(this.customFee) ? Number(this.customFee) : this.defaultTransactionParams.fee);
      accountBalance = accountBalance.minus(
        this.customStorageLimit && Number(this.customStorageLimit)
          ? Number(Big(this.customStorageLimit).times(this.costPerByte).div('1000000'))
          : this.defaultTransactionParams.burn
      );
      accountBalance = accountBalance.minus(0.000001); // dust
      return {
        tez: accountBalance.toFixed(),
        lqd: Big(this.lqdBalance).toFixed(),
        tzBTC: Big(this.tzBTCBalance).toFixed()
      };
    }
  }
  async estimateFees(): Promise<void> {
    console.log('estimate..');
    const prevSimError = this.latestSimError;
    this.latestSimError = '';
    let txs: PartiallyPreparedTransaction[] = [];
    try {
      txs = this.getMinimalPreparedTxs();
      this.transactions = txs;
    } catch (e) {
      console.log(e);
    }
    if (txs?.length) {
      this.simSemaphore++;
      this.latestSimError = '';
      const callback = (res) => {
        if (res) {
          this.formInvalid = this.checkBalances();
          if (res.error) {
            this.latestSimError = res.error.message;
          } else {
            this.defaultTransactionParams = res;
            this.latestSimError = '';
          }
          console.log(res, txs);
        } else {
          console.log('no res');
        }
        this.simSemaphore--;
      };
      this.estimateService.estimateTransactions(JSON.parse(JSON.stringify(txs)), this.activeAccount.address, undefined, callback);
    } else {
      this.latestSimError = prevSimError;
    }
  }
  updateMaxAmount(input: string = 'qtyRaw'): void {
    if (this.activeAccount) {
      const balances = this.getMaxAmount(this.activeAccount);
      if (!balances) {
        return;
      }
      let balance: string = '0.0';
      if (this.entrypoint === this.LqdEntrypoints.removeLiquidity) {
        balance = balances?.lqd;
        this.qtyRaw = balance;
        this.update('qtyRaw');
      } else if (this.entrypoint === this.LqdEntrypoints.tokenToXtz) {
        if (input === 'qtyRaw') {
          balance = balances?.tzBTC;
          this.qtyRaw = balance;
          this.update('qtyRaw');
        } else {
          balance = balances?.tez;
          this.qtyRawOut = balance;
          this.update('qtyRawOut');
        }
      } else if (this.entrypoint === this.LqdEntrypoints.xtzToToken || this.entrypoint === this.LqdEntrypoints.addLiquidity) {
        if (input === 'qtyRawOut') {
          balance = balances?.tzBTC;
          this.qtyRawOut = balance;
          this.update('qtyRawOut');
        } else {
          balance = balances?.tez;
          this.qtyRaw = balance;
          this.update('qtyRaw');
        }
      }
    }
  }
  getMinimalPreparedTxs(): PartiallyPreparedTransaction[] {
    if (this.entrypoint === LqdEntrypoints.xtzToToken) {
      return (this.transactions = [
        {
          kind: 'transaction',
          amount: this.qty.internalNormalised.toString(),
          destination: this.lqdContract,
          parameters: this.operationService.getXTZToTokenParameters(
            this.activeAccount.address,
            this.minimumToken.internalBigInt.toFixed(0).toString(),
            (Date.now() + 60 * 60 * 1000).toString()
          )
        }
      ]);
    } else if (this.entrypoint === LqdEntrypoints.tokenToXtz) {
      return (this.transactions = [
        {
          kind: 'transaction',
          amount: '0',
          destination: this.tzBTCContract,
          parameters: this.operationService.getRevokeAmountParameters(this.lqdContract)
        },
        {
          kind: 'transaction',
          amount: '0',
          destination: this.tzBTCContract,
          parameters: this.operationService.getApproveAmountParameters(this.lqdContract, this.qty.internalBigInt.toFixed(0).toString())
        },
        {
          kind: 'transaction',
          amount: '0',
          destination: this.lqdContract,
          parameters: this.operationService.getTokenToXTZParameters(
            this.activeAccount.address,
            this.qty.internalBigInt.toFixed(0).toString(),
            this.minimumXtz.internalBigInt.toFixed(0).toString(),
            (Date.now() + 60 * 60 * 1000).toString()
          )
        },
        {
          kind: 'transaction',
          amount: '0',
          destination: this.tzBTCContract,
          parameters: this.operationService.getRevokeAmountParameters(this.lqdContract)
        }
      ]);
    } else if (this.entrypoint === LqdEntrypoints.removeLiquidity) {
      return (this.transactions = [
        {
          kind: 'transaction',
          amount: '0',
          destination: this.lqdContract,
          parameters: this.operationService.getRemoveLiquidityParameters(
            this.activeAccount.address,
            this.qty.internalBigInt.toFixed(0).toString(),
            this.minimumXtz.internalBigInt.toFixed(0).toString(),
            this.minimumToken.internalBigInt.toFixed(0).toString(),
            (Date.now() + 60 * 60 * 1000).toString()
          )
        }
      ]);
    } else if (this.entrypoint === LqdEntrypoints.addLiquidity) {
      return (this.transactions = [
        {
          kind: 'transaction',
          amount: '0',
          destination: this.tzBTCContract,
          parameters: this.operationService.getRevokeAmountParameters(this.lqdContract)
        },
        {
          kind: 'transaction',
          amount: '0',
          destination: this.tzBTCContract,
          parameters: this.operationService.getApproveAmountParameters(this.lqdContract, this.qtyOut.internalBigInt.toFixed(0))
        },
        {
          kind: 'transaction',
          amount: this.qty.internalNormalised.toString(),
          destination: this.lqdContract,
          parameters: this.operationService.getAddLiquidityParameters(
            this.activeAccount.address,
            this.minimumLqd.internalBigInt.toFixed(0).toString(),
            this.qtyOut.internalBigInt.toFixed(0).toString(),
            (Date.now() + 60 * 60 * 1000).toString()
          )
        },
        {
          kind: 'transaction',
          amount: '0',
          destination: this.tzBTCContract,
          parameters: this.operationService.getRevokeAmountParameters(this.lqdContract)
        }
      ]);
    }
  }
  getFullyPreparedTxs(): FullyPreparedTransaction[] {
    assert(!this.simSemaphore, 'Awaiting request');
    const minimalTxs = this.getMinimalPreparedTxs();
    this.transactions = minimalTxs;
    assert(this.inputValidationService.fee(this.customFee), 'Invalid fee');
    assert(this.inputValidationService.gas(this.customGasLimit), 'Invalid gas limit');
    assert(this.inputValidationService.gas(this.customStorageLimit), 'Invalid storage limit');
    assert(!this.checkBalances(), this.checkBalances());
    assert(minimalTxs.length === this.defaultTransactionParams.customLimits?.length, 'Simulation error');
    return this.opsWithCustomLimits();
  }
  opsWithCustomLimits(): FullyPreparedTransaction[] {
    let extraGas: number = 0;
    let extraStorage: number = 0;
    if (this.customGasLimit && this.customGasLimit !== this.defaultTransactionParams.gas.toString()) {
      extraGas = Number(this.customGasLimit) - this.defaultTransactionParams.gas;
    }
    if (this.customStorageLimit && this.customStorageLimit !== this.defaultTransactionParams.storage.toString()) {
      extraStorage = Number(this.customStorageLimit) - this.defaultTransactionParams.storage;
    }
    const extraGasPerOp: number = Math.round(extraGas / this.transactions.length);
    const extraStoragePerOp: number = Math.round(extraStorage / this.transactions.length);
    const txs: FullyPreparedTransaction[] = [];
    for (let i = 0; i < this.transactions.length; i++) {
      let gasLimit: string = extraGas
        ? (Number(this.defaultTransactionParams.customLimits[i].gasLimit) + extraGasPerOp).toString()
        : this.defaultTransactionParams.customLimits[i].gasLimit.toString();
      let storageLimit = extraStorage
        ? (Number(this.defaultTransactionParams.customLimits[i].storageLimit) + extraStoragePerOp).toString()
        : this.defaultTransactionParams.customLimits[i].storageLimit.toString();
      gasLimit = !(Number(gasLimit) < 0) ? gasLimit : '0';
      storageLimit = !(Number(storageLimit) < 0) ? storageLimit : '0';
      const fullyTx: FullyPreparedTransaction = {
        ...this.transactions[i],
        fee: i === this.transactions.length - 1 ? this.getTotalFee().toString() : '0',
        gasLimit,
        storageLimit
      };
      txs.push(fullyTx);
    }
    return txs;
  }
  checkBalances(): string {
    if (this.transactions.length > 0 && this.activeAccount) {
      const balances = this.getMaxAmount(this.activeAccount);
      if (balances) {
        const maxTez = Big(balances?.tez).minus(0.000001);
        const maxLQD = Big(balances.lqd).plus(0.0);
        const maxtzBTC = Big(balances.tzBTC).plus(0.0);
        let amount = Big(0);
        for (const tx of this.transactions) {
          amount = amount.plus(Big(tx.amount));
        }
        if (this.entrypoint === LqdEntrypoints.xtzToToken) {
          if (!!maxTez && amount.gt(maxTez)) {
            return this.translate.instant('SWAPCOMPONENT.TOOHIGHFEEORAMOUNT');
          }
          if (this.minimumToken && this.minimumToken.internalNormalised === 0) {
            return this.translate.instant('SWAPCOMPONENT.TOOSMALLAMOUNT');
          }
        } else if (this.entrypoint === LqdEntrypoints.tokenToXtz) {
          if (Big(this.qty.internalNormalised).gt(maxtzBTC)) {
            return this.translate.instant('SWAPCOMPONENT.TOOHIGHAMOUNT');
          }
          if (this.minimumXtz && this.minimumXtz.internalNormalised === 0) {
            return this.translate.instant('SWAPCOMPONENT.TOOSMALLAMOUNT');
          }
        } else if (this.entrypoint === LqdEntrypoints.addLiquidity) {
          if (!!maxTez && amount.gt(maxTez)) {
            return this.translate.instant('SWAPCOMPONENT.TOOHIGHAMOUNT');
          }
          if (this.qtyOut && Big(this.qtyOut.internalNormalised).gt(maxtzBTC)) {
            return this.translate.instant('SWAPCOMPONENT.TOOHIGHAMOUNT');
          }
          if (this.xtzRequired && this.xtzRequired.internalNormalised === 0) {
            return this.translate.instant('SWAPCOMPONENT.TOOSMALLAMOUNT');
          }
          if (this.minimumLqd && this.minimumLqd.internalNormalised === 0) {
            return this.translate.instant('SWAPCOMPONENT.TOOSMALLAMOUNT');
          }
        } else if (this.entrypoint === LqdEntrypoints.removeLiquidity) {
          if (Big(this.qty.internalNormalised).gt(maxLQD)) {
            return this.translate.instant('SWAPCOMPONENT.TOOHIGHAMOUNT');
          }
          if (this.minimumXtz && this.minimumXtz.internalNormalised === 0) {
            return this.translate.instant('SWAPCOMPONENT.TOOSMALLAMOUNT');
          }
        }
      }
    }
    return '';
  }
  sanitizeNumberInput(e, decimalPlaces: number, type = ''): void {
    const exp = new RegExp(`^\\d{0,}(\\.\\d{0,${decimalPlaces}})?\$`, 'g');
    if (type === 'qtyRaw') {
      if (exp.test(e?.target?.value)) {
        this.qtyRaw = e?.target?.value;
      } else {
        e.target.value = this.qtyRaw;
      }
      this.evalAmount('qtyRaw');
    } else if (type === 'qtyRawOut') {
      if (exp.test(e?.target?.value)) {
        this.qtyRawOut = e?.target?.value;
      } else {
        e.target.value = this.qtyRawOut;
      }
      this.evalAmount('qtyRawOut');
    } else {
      if (exp.test(e?.target?.value)) {
        this[type] = e?.target?.value;
      } else {
        e.target.value = this[type];
      }
    }
  }
  evalAmount(type: string = 'qtyRaw'): void {
    let qty = this[type];
    if (parseFloat(qty) < 0.0 || !qty) {
      this.qtyRawOut = this.qtyRaw = '';
      return;
    } else if (isNaN(parseFloat(qty)) && parseFloat(qty) === 0.0) {
      return;
    } else if (!isNaN(parseFloat(qty))) {
      this.update(type);
    }
  }
  openInfoModal(title: string): void {
    switch (title) {
      case 'slippage':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message:
              'Token prices in a pool may change significantly within seconds. Slippage tolerance defines the difference between the expected and current exchange rate that you find acceptable. The higher the slippage tolerance, the more likely a transaction will go through.',
            title: 'Slippage Information'
          },
          forceClose: false
        });
        break;
      case 'pricerate':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The amount of token B you receive for 1 token A, per the current exchange rate.',
            title: 'Price Rate Information'
          },
          forceClose: false
        });
        break;
      case 'impactdouble':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The impact your transaction is expected to make on the exchange rate.',
            title: 'Price Impact'
          },
          forceClose: false
        });
        break;
      case 'minimumxtz':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The minimum amount of XTZ to be received from the transaction.',
            title: 'Minimum XTZ'
          },
          forceClose: false
        });
        break;
      case 'requiredtoken':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'Required tzBTC needed for transaction.',
            title: 'Required tzBTC'
          },
          forceClose: false
        });
        break;
      case 'minimumtoken':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The minimum amount of tzBTC to be received from the transaction.',
            title: 'Minimum tzBTC'
          },
          forceClose: false
        });
        break;
      case 'minimumlqt':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The minimum amount of SIRS to be received from the transaction.',
            title: 'Minimum SIRS'
          },
          forceClose: false
        });
        break;
      default:
        break;
    }
  }
}
