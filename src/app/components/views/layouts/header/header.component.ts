import { Component, OnInit, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { Account } from '../../../../services/wallet/wallet';
import { LookupService } from '../../../../services/lookup/lookup.service';
import { MessageService } from '../../../../services/message/message.service';
import { CONSTANTS as _CONSTANTS } from '../../../../../environments/environment';
import { filter } from 'rxjs/operators';
import copy from 'copy-to-clipboard';
import { TranslateService } from '@ngx-translate/core';
import { ModalComponent } from '../../../modals/modal.component';
import { DelegateService } from '../../../../services/delegate/delegate.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { Subscription } from 'rxjs';
import { DeeplinkService } from '../../../../services/deeplink/deeplink.service';
import { UnlockableService } from '../../../../services/unlockable/unlockable.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['../../../../../scss/components/views/layouts/header/header.component.scss']
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {
  window = window;
  document = document;
  @Input() activeAccount: Account;
  accounts: Account[];
  delegateName = '';
  readonly CONSTANTS = _CONSTANTS;
  private subscriptions: Subscription = new Subscription();
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private deeplinkService: DeeplinkService,
    public walletService: WalletService,
    public lookupService: LookupService,
    private messageService: MessageService,
    private translate: TranslateService,
    private delegateService: DelegateService,
    private subjectService: SubjectService,
    public unlockableService: UnlockableService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.subjectService.walletUpdated.subscribe(async () => {
        this.accounts = this.walletService.wallet?.getAccounts();
        this.delegateName = await this.getDelegateName(this.activeAccount?.delegate);
      })
    );
    this.accounts = this.walletService.wallet?.getAccounts();
    this.subscriptions.add(
      this.route.queryParams.subscribe(async (params) => {
        if (params?.type) {
          this.deeplinkService.set(params);
        }
      })
    );
    this.subscriptions.add(
      this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)).subscribe(async (r: NavigationEnd) => {
        document.body.scrollTop = 0;
        if (!(this.accounts?.length > 0) && r.url.indexOf('/account/') === 0) {
          this.router.navigateByUrl('/');
        } else if (this.accounts?.length > 0 && !r.url.match(/terms\-of\-use|privacy\-policy/g)) {
          let accountAddress = r.url.substr(r.url.indexOf('/account/') + 9);
          accountAddress = accountAddress.indexOf('/') !== -1 ? accountAddress.substring(0, accountAddress.indexOf('/')) : accountAddress;
          if (!this.walletService.addressExists(accountAddress)) {
            this.router.navigateByUrl(`/account/${this.accounts[0].address}`);
            this.activeAccount = this.accounts[0];
            this.subjectService.activeAccount.next(this.accounts[0]);
          } else {
            this.activeAccount = this.walletService.wallet?.getAccount(accountAddress);
            this.subjectService.activeAccount.next(this.activeAccount);
          }
          this.delegateName = await this.getDelegateName(this.activeAccount?.delegate);
        }
      })
    );
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes?.activeAccount?.currentValue) {
      this.delegateName = await this.getDelegateName(changes?.activeAccount?.currentValue.delegate);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  logout(): void {
    this.subjectService.logout.next(true);
    this.messageService.clear();
    this.walletService.clearWallet();
    this.lookupService.clear();
    this.router.navigate(['']);
  }
  copy(): void {
    copy(this.activeAccount.address);
    const copyToClipboard = this.translate.instant('OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD');
    this.messageService.add(this.activeAccount.address + ' ' + copyToClipboard, 5);
  }

  toggleDropdown(sel): void {
    document.querySelector(sel).parentNode.classList.toggle('expanded');
  }
  newAccount(): void {
    ModalComponent.currentModel.next({ name: 'new-implicit', data: null });
  }
  receive(): void {
    ModalComponent.currentModel.next({
      name: 'receive',
      data: { address: this.activeAccount.address }
    });
  }

  async getDelegateName(address: string): Promise<string> {
    return address
      ? (await this.delegateService.resolveDelegateByAddress(address))?.name ??
          address.substring(0, 7) + '...' + address.substring(address.length - 4, address.length)
      : address;
  }
}
