import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Account, TorusWallet } from '../../../../../services/wallet/wallet';
import { WalletService } from '../../../../../services/wallet/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../../services/message/message.service';
import { TokenService } from '../../../../../services/token/token.service';
import { CONSTANTS } from '../../../../../../environments/environment';
import { TokenBalancesService } from '../../../../../services/token-balances/token-balances.service';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { DisplayLinkOption } from '../../../../../interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nfts',
  templateUrl: './nfts.component.html',
  styleUrls: ['../../../../../../scss/components/views/logged-in/account-view/cards/nfts/nfts.component.scss']
})
export class NftsComponent implements OnInit, OnDestroy {
  DisplayLinkOption = DisplayLinkOption;
  Object = Object;
  nfts = undefined;
  nftsArray = [];
  tokens = [];
  isDiscover: boolean = false;
  isInitLoad: boolean = true;
  filter: string = 'APP';
  contractAliases = Object.keys(CONSTANTS.CONTRACT_ALIASES).map((key: any) => ({ key, ...CONSTANTS.CONTRACT_ALIASES[key] }));
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
    this.subscriptions.add(
      this.subjectService.nftsUpdated.subscribe((p) => {
        const activeAddress = this.walletService.activeAccount.getValue()?.address;
        if (activeAddress !== this.activeAddress) {
          this.activeAddress = activeAddress;
          this.reset();
        }
        if (this.isInitLoad) {
          if (!p?.nfts || !Object.keys(p.nfts)?.length) {
            this.isDiscover = true;
          } else {
            this.isInitLoad = false;
            this.isDiscover = false;
          }
        }
        this.nfts = p?.nfts;
        this.nftsArray = p?.nfts
          ? Object.keys(p.nfts).map((key: any) => ({
              key,
              ...p.nfts[key]
            }))
          : [];
        this.tokens = p?.nfts
          ? Object.keys(p.nfts)
              .map((key: any) => p.nfts[key]?.tokens)
              .flat()
          : [];
      })
    );
    this.subscriptions.add(
      this.subjectService.logout.subscribe((o) => {
        if (o) {
          this.reset();
          this.activeAddress = '';
        }
      })
    );
    this.subscriptions.add(
      this.walletService.activeAccount.subscribe((activeAccount) => {
        const activeAddress = activeAccount?.address;
        if (activeAddress !== this.activeAddress) {
          this.activeAddress = activeAddress;
          this.reset();
        }
      })
    );
  }
  @Input() activity: any;
  @Input() account;
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  displayTokenCard(): boolean {
    return this.nfts !== undefined;
  }
  toggleDropdown(sel): void {
    if (this.filter === sel) {
      this.filter = '';
    } else {
      this.filter = sel;
      const c = document.querySelector('#' + sel) as HTMLElement;
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.body.scroll(0, c.offsetTop - 25);
        }, 25);
      }
    }
  }
  shouldDisplayLink(option: DisplayLinkOption): boolean {
    if (option === 0 || (option === 1 && this.walletService.wallet instanceof TorusWallet)) {
      return true;
    }
    return false;
  }
  sanitizeKey(key: string): string {
    return key?.replace(/ /g, '');
  }

  trackContract(index: number, contract: any) {
    return contract?.key ? contract.key : index;
  }

  getContractAlias(category): string {
    return category?.join(' · ');
  }
  reset(): void {
    this.nfts = undefined;
    this.isDiscover = false;
    this.tokens = [];
    this.nftsArray = [];
    this.isInitLoad = true;
    this.filter = 'APP';
  }
}
