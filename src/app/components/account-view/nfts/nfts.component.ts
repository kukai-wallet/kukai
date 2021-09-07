import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Account, TorusWallet } from '../../../services/wallet/wallet';
import { WalletService } from '../../../services/wallet/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../services/message/message.service';
import { TokenService } from '../../../services/token/token.service';
import { CONSTANTS } from '../../../../environments/environment';
import { ModalComponent } from '../../modal/modal.component';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';
import { SubjectService } from '../../../services/subject/subject.service';
import { DisplayLinkOption } from '../../../interfaces';
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
  nftsArray = [];
  tokens = [];
  isDiscover: boolean = false;
  isInitLoad: boolean = true;
  filter: string = 'APP';
  contractAliases = Object.keys(CONSTANTS.CONTRACT_ALIASES).map((key: any) => ({key: key, ...(CONSTANTS.CONTRACT_ALIASES[key])}));
  activeAddress: string = '';
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
      const activeAddress = this.walletService.activeAccount.getValue()?.address;
      if (activeAddress !== this.activeAddress) {
        this.activeAddress = activeAddress;
        this.reset();
      }
      if(this.isInitLoad) {
        if (!nfts || !Object.keys(nfts)?.length) {
          this.isDiscover = true;
        } else {
          this.isInitLoad = false;
          this.isDiscover = false;
        }
      }
      console.log("here");
      this.nfts = nfts;
      this.nftsArray = nfts ? Object.keys(nfts).map((key: any) => ({key: key, ...(nfts[key])})) : [];
      this.tokens = nfts ? Object.keys(nfts).map((key: any) => nfts[key]?.tokens).flat() : [];
    }));
    this.subscriptions.add(this.subjectService.logout.subscribe(o => {
      if (o) {
        this.reset();
        this.activeAddress = '';
      }
    }));
    this.subscriptions.add(this.walletService.activeAccount.subscribe(activeAccount => {
      const activeAddress = activeAccount?.address;
      if (activeAddress !== this.activeAddress) {
        this.activeAddress = activeAddress;
        this.reset();
      }
    }));
  }
  @Input() activity: any;
  @Input() account;
  ngOnInit(): void {
    console.log(this.nfts)
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  displayTokenCard(): boolean {
    return this.nfts !== undefined;
  }
  toggleDropdown(sel) {
    const c = document.querySelector('#' + sel) as HTMLElement;
    if (this.filter === sel) {
      this.filter = '';
    } else {
      this.filter = '';
      this.filter = sel;
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
  sanitizeKey(key: string) {
    return key?.replace(/ /g, '');
  }

  trackContract(index: number, key: any) {
    return key;
  }

  getContractAlias(category) {
    return category?.join(' · ');
  }
  reset() {
    this.nfts = undefined;
    this.isDiscover = false;
    this.tokens = [];
    this.isInitLoad = true;
    this.filter = 'APP';
  }
}