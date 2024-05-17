import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TorusWallet } from '../../../../../services/wallet/wallet';
import { WalletService } from '../../../../../services/wallet/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../../services/message/message.service';
import { TokenService } from '../../../../../services/token/token.service';
import { TokenBalancesService } from '../../../../../services/token-balances/token-balances.service';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { KukaiService, DiscoverItem } from '../../../../../services/kukai/kukai.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nfts',
  templateUrl: './nfts.component.html',
  styleUrls: ['../../../../../../scss/components/views/logged-in/account-view/cards/nfts/nfts.component.scss']
})
export class NftsComponent implements OnInit, OnDestroy {
  Object = Object;
  nfts = undefined;
  nftsArray = [];
  displayedNftsArray = [];
  tokens = [];
  isDiscover: boolean = false;
  isInitLoad: boolean = true;
  filter: string = 'APP';
  discoverItems: DiscoverItem[] = [];
  activeAddress: string = '';
  sliceEnd = 20;
  sliceIncrement = 10;
  private subscriptions: Subscription = new Subscription();
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public tokenService: TokenService,
    private subjectService: SubjectService,
  ) {
    this.subscriptions.add(
      this.subjectService.nftsUpdated.subscribe((n) => {
        this.populateNfts(n);
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
      this.subjectService.activeAccount.subscribe((activeAccount) => {
        const activeAddress = activeAccount?.address;
        if (activeAddress !== this.activeAddress) {
          this.activeAddress = activeAddress;
          this.reset();
        }
      })
    );
    this.subscriptions.add(
      this.subjectService.discoverItems.subscribe((discoverItems) => {
        this.discoverItems = discoverItems;
      })
    );
  }
  @Input() activity: any;
  @Input() account;
  ngOnInit(): void {
    document.addEventListener(
      'scroll',
      (event) => {
        const height = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        if (height < document.body.scrollTop + document.body.clientHeight + 250) {
          this.refreshDisplayedNfts(true);
        }
      },
      true
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  populateNfts(n) {
    if (!n) return;
    if (this.isInitLoad) {
      if (!n?.nfts || !Object.keys(n.nfts)?.length) {
        this.isDiscover = true;
      } else {
        this.isInitLoad = false;
        this.isDiscover = false;
      }
    }
    this.nfts = n?.nfts;
    const nftsArray = n?.nfts ? Object.keys(n.nfts).map((key: any) => ({ key, ...n.nfts[key] })) : [];
    const nftsWithCollectionAlias = [];
    const nftsWithoutCollectionAlias = [];
    let unknownNftCollection = null;

    // this will do the following:
    // 1. order collections with alias from kukai service according to the order there
    // 2. maintain the received order of collections without an alias
    // 3. put unknown tokens at the bottom
    for (const collection of nftsArray) {
      if (collection.aliasOrder == null) {
        if (collection.key === 'unknown') {
          unknownNftCollection = collection;
        } else {
          nftsWithoutCollectionAlias.push(collection);
        }
      } else {
        nftsWithCollectionAlias.push(collection);
      }
    }
    nftsWithCollectionAlias.sort((a, b) => (a.aliasOrder < b.aliasOrder ? -1 : 1));

    this.nftsArray = nftsWithCollectionAlias.concat(nftsWithoutCollectionAlias, unknownNftCollection ? unknownNftCollection : []);

    this.refreshDisplayedNfts();
    this.tokens = n?.nfts
      ? Object.keys(n.nfts)
          .map((key: any) => n.nfts[key]?.tokens)
          .flat()
      : [];
  }
  refreshDisplayedNfts(showMore = false) {
    if (!this.tokenService?.initialized) {
      return;
    }
    let incremented = false;
    if (showMore && this.sliceEnd <= this.displayedNftsArray.length) {
      this.sliceEnd += this.sliceIncrement;
      incremented = true;
    }
    if (!showMore || incremented) {
      this.displayedNftsArray = this.nftsArray.slice(0, this.sliceEnd);
    }
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
  sanitizeKey(key: string): string {
    return 'ku' + key?.replace(/ /g, '');
  }

  trackContract(index: number, contract: any): string | number {
    return contract?.key ? contract.key : index;
  }

  getContractCategories(categories: string[]): string {
    return categories.join(' · ');
  }
  reset(): void {
    this.nfts = undefined;
    this.isDiscover = false;
    this.tokens = [];
    this.nftsArray = [];
    this.displayedNftsArray = [];
    this.isInitLoad = true;
    this.filter = 'APP';
    this.sliceEnd = 20;
  }
}
