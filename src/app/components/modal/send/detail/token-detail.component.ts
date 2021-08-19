import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../../modal.component';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { TokenBalancesService } from '../../../../services/token-balances/token-balances.service';
import { Big } from 'big.js';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.component.html',
  styleUrls: ['../../../../../scss/components/modal/modal.scss']
})
export class TokenDetail extends ModalComponent implements OnInit {
  Object = Object;
  token = null;
  tokenFiltered = {};
  activeAccount = null;
  moreInfo = false;
  imageExpanded = false;
  autoOverflow = false;
  descOverflow = false;
  isNFT = false;
  name = "token-detail";
  readonly blacklistMeta = ['name', 'kind', 'displayAsset', 'thumbnailAsset', 'rawUrl', 'isTransferable', 'isBooleanAmount', 'balance', 'category', 'symbol', 'decimals', 'status', 'shouldPreferSymbol', 'price', 'isUnknownToken'];

  constructor(
    private walletService: WalletService,
    private tokenBalancesService: TokenBalancesService
  ) { super(); }

  ngOnInit(): void {
    this.walletService.activeAccount.subscribe(activeAccount => {
      this.activeAccount = activeAccount;
    });
  }

  open(data) {
    !!data ? Object.keys(data).filter(key => !this.blacklistMeta.includes(key)).forEach(key => (this.tokenFiltered[key] = data[key])) : undefined;
    this.token = data;
    this.isNFT = this.tokenBalancesService.isNFT(this.token);
    this.descOverflow = this.token?.description && this.token?.description.length > 250 ? true : false;
    super.open();
  }

  close() {
    this.reset();
    super.close();
  }

  expand() {
    this.moreInfo = !this.moreInfo;
    if(!this.autoOverflow) {
      setTimeout(() => {
        this.autoOverflow = !this.autoOverflow;
      }, 160)
    } else {
      this.autoOverflow = !this.autoOverflow;
    }
  }

  expandImage() {
    this.imageExpanded = !this.imageExpanded;
  }

  reset() {
    this.moreInfo = false;
    this.imageExpanded = false;
    this.descOverflow = false;
  }

  getBalance() {
    return !this.token ?
      this.activeAccount?.balanceXTZ !== null ?
        Big(this.activeAccount?.balanceXTZ).div(1000000).toFixed() :
        '—' :
      this.token?.balance;
  }

  getBalanceFiat() {
    return !this.token ? this.activeAccount?.balanceUSD || undefined : this.token?.price && this.token.price >= 0.005 ? this.token.price : undefined;
  }
}

