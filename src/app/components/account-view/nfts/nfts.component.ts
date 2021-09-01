import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TorusWallet } from '../../../services/wallet/wallet';
import { WalletService } from '../../../services/wallet/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../services/message/message.service';
import { TokenService } from '../../../services/token/token.service';
import { CONSTANTS } from '../../../../environments/environment';
import { ModalComponent } from '../../modal/modal.component';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';
import { SubjectService } from '../../../services/subject/subject.service';
import { DisplayLinkOption } from '../../../interfaces';
import Big from 'big.js';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nfts',
  templateUrl: './nfts.component.html',
  styleUrls: ['../../../../scss/components/account-view/cards/nfts/nfts.component.scss'],
})
export class NftsComponent implements OnInit, OnDestroy {
  DisplayLinkOption = DisplayLinkOption;
  Object = Object;
  Number = Number;
  nfts = undefined;
  tokens = [];
  isDiscover: boolean = false;
  isInitLoad: boolean = true;
  filter: string = 'APP';
  contractAliases = CONSTANTS.CONTRACT_ALIASES;
  private subscriptions: Subscription = new Subscription();
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public tokenService: TokenService,
    public tokenBalancesService: TokenBalancesService,
    private subjectService: SubjectService,
    private walletService: WalletService
  ) {
    this.subscriptions.add(this.subjectService.nftsUpdated.subscribe(nfts => {
      if(this.isInitLoad) {
        if (!nfts || !Object.keys(nfts)?.length) {
          this.isDiscover = true;
        } else {
          this.isInitLoad = false;
          this.isDiscover = false;
        }
      }
      this.nfts = nfts;
      this.tokens = nfts ? Object.keys(nfts).map((key: any) => nfts[key]?.tokens).flat() : [];
    }));
    this.subscriptions.add(this.subjectService.logout.subscribe(o => {
      if (o) {
        this.nfts = undefined;
        this.isDiscover = false;
      }
    }));
    this.subscriptions.add(this.walletService.activeAccount.subscribe(activeAccount => {
      this.isInitLoad = true;
    }));
  }
  @Input() activity: any;
  @Input() account;
  ngOnInit(): void { }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  displayTokenCard(): boolean {
    return this.nfts !== undefined;
  }
  toggleDropdown(sel) {
    const elem = [].slice.call(document.querySelectorAll(`.nfts .collection`));
    const c = document.querySelector(sel);
    if (c.classList.contains('expanded')) {
      c.classList.remove('expanded');
      this.filter = '';
    } else {
      elem.forEach(coll => { if (coll.classList.contains('expanded')) { coll.classList.remove('expanded'); } });
      c.classList.add('expanded');
      this.filter = sel.substring(1);
      if (window.innerWidth < 1024) {
        document.body.scroll(0, c.offsetTop - 25);
      }
    }
  }
  shouldDisplayLink(option: DisplayLinkOption) {
    if (option === 0 || (option === 1 && this.walletService.wallet instanceof TorusWallet)) {
      return true;
    }
    return false;
  }
  sanitizeKey(key: string, i: number) {
    return key.replace(/ /g, '') + i;
  }
}