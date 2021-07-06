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
  token = {};
  tokenFiltered = {};
  activeAccount = null;
  moreInfo = false;
  imageExpanded = false
  name = "token-detail";
  blacklistMeta = ['name', 'description', 'kind', 'displayUrl', 'thumbnailUrl', 'isTransferable', 'isBooleanAmount', 'balance', 'category', 'symbol', 'decimals'];

  constructor(
    private route: ActivatedRoute,
    private walletService: WalletService,
    private router: Router,
    public cd: ChangeDetectorRef
  ) { super(cd); }

  ngOnInit(): void {
    this.walletService.activeAccount.subscribe(activeAccount => {
      this.activeAccount = activeAccount;
    });
  }

  open(data) {
    Object.keys(data).filter(key => !this.blacklistMeta.includes(key)).forEach(key => (this.tokenFiltered[key] = data[key]));
    this.token = data;
    super.open();
  }

  expand() {
    this.moreInfo = this.moreInfo ? false : true;
  }

  expandImage() {
    this.imageExpanded = this.imageExpanded ? false : true;
  }
}

