import { AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TorusWallet } from '../../../../services/wallet/wallet';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../services/message/message.service';
import { TokenService } from '../../../../services/token/token.service';
import { CONSTANTS } from '../../../../../environments/environment';
import { ModalComponent } from '../../../modal/modal.component';
import { TokenBalancesService } from '../../../../services/token-balances/token-balances.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { DisplayLinkOption } from '../../../../interfaces';
import Big from 'big.js';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nfts-body',
  templateUrl: './body.component.html',
  styleUrls: ['../../../../../scss/components/account-view/cards/nfts/body.component.scss'],
})
export class NftsBodyComponent implements OnInit, AfterViewInit, OnDestroy {
  DisplayLinkOption = DisplayLinkOption;
  Object = Object;
  Number = Number;
  @ViewChild('body') body;
  @Input() isDisplaying;
  @Input() tokens;
  @Input() account;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;
  sliceEnd = 30;
  private subscriptions: Subscription = new Subscription();
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public tokenService: TokenService,
    public tokenBalancesService: TokenBalancesService,
    private subjectService: SubjectService,
    private walletService: WalletService
  ) {}
  ngOnInit(): void { }
  ngAfterViewInit() {
    this.body?.nativeElement.addEventListener('scroll', (e) => {
      if(e?.target?.scrollTop >= (e?.target?.scrollHeight - e?.target?.clientHeight)) {
        this.sliceEnd += 30;
      }
    });
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  viewToken(token) {
    ModalComponent.currentModel.next({ name: 'token-detail', data: token });
  }
  formatBalance(token) {
    return Big(token.balance).div(10 ** parseInt(token.decimals)).toFixed();
  }
  trackToken(index: number, token: any) {
    return token?.id ? token.contractAddress + ':' + token?.id + ':' + token?.balance : null;
  }
}