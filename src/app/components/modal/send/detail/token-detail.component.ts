import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { TemplateRequest, TemplateFee, FullyPreparedTransaction } from '../../../send/interfaces';
import { Template, BaseTemplate } from 'kukai-embed';
import { ModalComponent } from '../../modal.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { timeStamp } from 'console';
import { ChangeDetectorRef } from '@angular/core';

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
  name = "token-detail";
  blacklistMeta = ['name', 'kind', 'displayUrl', 'thumbnailUrl', 'isTransferable', 'isBooleanAmount', 'balance', 'category', 'symbol', 'decimals'];

  constructor(
    private walletService: WalletService,
  ) { super(); }

  ngOnInit(): void {
    this.walletService.activeAccount.subscribe(activeAccount => {
      this.activeAccount = activeAccount;
    });
  }

  open(data) {
    Object.keys(data).filter(key => !this.blacklistMeta.includes(key)).forEach(key => (this.tokenFiltered[key] = data[key]));
    this.token = data;
    this.descOverflow = this.token?.description && this.token?.description.length > 250 ? true : false
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
}

