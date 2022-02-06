import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TorusWallet } from '../../../../services/wallet/wallet';
import { LookupService } from '../../../../services/lookup/lookup.service';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { ModalComponent } from '../../modal.component';
import { Subscription } from 'rxjs';
import { ListComponent } from '../../../ui/generic/list.component';
import copy from 'copy-to-clipboard';
import { MessageService } from '../../../../services/message/message.service';
import { TranslateService } from '@ngx-translate/core';
import Big from 'big.js';
import { RemoveCommaPipe } from '../../../../pipes/remove-comma.pipe';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-account-list-body',
  templateUrl: './body.component.html',
  styleUrls: ['../../../../../scss/components/modals/account-list.scss']
})
export class AccountListBodyComponent extends ListComponent implements OnInit, AfterViewInit, OnDestroy {
  postfix = '';
  isMobile = false;
  @ViewChild('viewRef') viewRef: ElementRef;
  preSelectedAccount: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public router: Router,
    public lookupService: LookupService,
    private walletService: WalletService,
    public translate: TranslateService,
    public messageService: MessageService,
    public removeCommaPipe: RemoveCommaPipe
  ) {
    super();
    this.subscriptions.add(
      this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)).subscribe(async (r: NavigationEnd) => {
        let accountAddress = r.url.substr(r.url.indexOf('/account/') + 9);
        this.postfix = !!accountAddress.substring(36) ? accountAddress.substring(36) : '';
      })
    );
  }

  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.preSelectedAccount = this.current;
    }
    this.subscriptions.add(
      this.walletService.walletUpdated.subscribe(() => {
        this.list = this.walletService.wallet?.getAccounts();
      })
    );
    this.list = this.walletService.wallet?.getAccounts();

    const e = () => {
      this.isMobile = !!parseInt(document.documentElement.style.getPropertyValue('--is-mobile'));
    };
    window.addEventListener('resize', e);
    e();
  }

  ngAfterViewInit(): void {
    const selRef = this.viewRef.nativeElement.querySelector('.option.selected') as HTMLElement;
    this.viewRef.nativeElement.scrollTo(0, selRef.offsetTop - 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getUsername(address: string): string {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.displayName();
    } else {
      const party = this.lookupService.resolve({ address: address });
      if (party?.name) {
        return party.name;
      }
    }
    return '';
  }
  getVerifier(): string {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.verifier;
    } else {
      return 'domain';
    }
  }
  closeModal(): void {
    ModalComponent.currentModel.next({ name: '', data: null });
  }
  copy(e, address: string): void {
    e.stopPropagation();
    copy(address);
    const copyToClipboard = this.translate.instant('OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD');
    this.messageService.add(address + ' ' + copyToClipboard, 5);
  }
  getBalance(account): number | string {
    return Big(account?.balanceXTZ ?? 0)
      .div(1000000)
      .toFixed();
  }
  getBalanceFiat(account): number {
    return account?.balanceUSD ?? 0;
  }

  getTotalBalance(): number {
    return Big(this.walletService.wallet.totalBalanceXTZ ?? 0)
      .div(1000000)
      .toFixed();
  }

  getTotalFiat(): number {
    return this.walletService.wallet.totalBalanceUSD ?? 0;
  }
}
