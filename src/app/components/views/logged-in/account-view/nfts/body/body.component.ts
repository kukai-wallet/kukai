import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../../../services/message/message.service';
import { TokenService } from '../../../../../../services/token/token.service';
import { CONSTANTS } from '../../../../../../../environments/environment';
import { TokenBalancesService } from '../../../../../../services/token-balances/token-balances.service';
import { DisplayLinkOption } from '../../../../../../interfaces';
import { Subject } from 'rxjs';
import { Token } from '../../../../../../services/wallet/wallet';

@Component({
  selector: 'app-nfts-body',
  templateUrl: './body.component.html',
  styleUrls: ['../../../../../../../scss/components/views/logged-in/account-view/cards/nfts/body.component.scss']
})
export class NftsBodyComponent implements OnInit, OnChanges, AfterViewInit {
  DisplayLinkOption = DisplayLinkOption;
  @ViewChild('body') body;
  @Input() isDisplaying;
  @Input() tokens;
  @Input() searchable = false;
  tokensToDisplay = { loaded: [], filtered: [], raw: [] };
  contractAliases = CONSTANTS.CONTRACT_ALIASES;
  readonly chunkSize = 24;
  sliceEnd = this.chunkSize;
  inputUpdated = new Subject<any>();
  filter = '.*';

  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public tokenService: TokenService,
    public tokenBalancesService: TokenBalancesService
  ) {}
  ngOnInit(): void {
    this.refresh();
  }
  ngOnChanges(): void {
    if (this.isDisplaying) {
      this.refresh();
    }
  }
  refresh(): void {
    this.tokensToDisplay.raw = this.tokens;
    this.tokensToDisplay.filtered = this.search(this.tokens);
    this.tokensToDisplay.loaded = this.tokensToDisplay.filtered?.slice(0, this.sliceEnd);
  }
  ngAfterViewInit(): void {
    const cb = (e) => {
      if (
        this.body?.nativeElement?.scrollTop >= this.body?.nativeElement?.scrollHeight - this.body?.nativeElement?.clientHeight - 15 &&
        (this.sliceEnd < this.tokensToDisplay.raw?.length ?? 0)
      ) {
        this.sliceEnd += this.chunkSize;
        this.refresh();
      }
    };
    this.body?.nativeElement.addEventListener('scroll', cb, { passive: true });
    this.body?.nativeElement.addEventListener('touchmove', cb, { passive: true });
  }
  search(tokens): Token[] {
    if (this.filter.length > 0 && this.filter !== '.*') {
      return tokens.filter(
        (t: any) =>
          t.name.match(new RegExp(`.*${this.filter}.*`, 'i')) ||
          (!isNaN(Number(this.filter)) && t.id.toString().match(new RegExp(`.*${parseInt(this.filter)}.*`, 'g')))
      );
    }
    return tokens;
  }
  updateFilter(filter: string): void {
    const prevFilter = this.filter;
    this.filter = filter || '.*';
    if (prevFilter !== this.filter) {
      this.sliceEnd = this.chunkSize;
      this.refresh();
      this.body.nativeElement.scrollTo(0, 0);
    }
  }
  trackToken(index: number, token: any): string | number {
    return token?.contractAddress ? token?.contractAddress + ':' + token?.id : index;
  }
}
