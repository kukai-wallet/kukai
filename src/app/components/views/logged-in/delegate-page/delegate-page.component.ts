import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { DelegateService } from '../../../../services/delegate/delegate.service';
import { ModalComponent } from '../../../modals/modal.component';
import { InputValidationService } from '../../../../services/input-validation/input-validation.service';
import { MessageService } from '../../../../services/message/message.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SubjectService } from '../../../../services/subject/subject.service';

@Component({
  selector: 'app-delegate-page',
  templateUrl: './delegate-page.component.html',
  styleUrls: ['../../../../../scss/components/views/logged-in/delegate/delegate.component.scss']
})
export class DelegatePageComponent implements OnInit, OnDestroy {
  delegates;
  activeAccount = null;
  customAddress: string = '';
  isShowingCustom = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public delegateService: DelegateService,
    public router: Router,
    public walletService: WalletService,
    public inputValidationService: InputValidationService,
    private messageServcie: MessageService,
    private subjectService: SubjectService
  ) {
    this.subscriptions.add(
      this.subjectService.activeAccount.subscribe((activeAccount) => {
        if (this.activeAccount !== activeAccount) {
          this.activeAccount = activeAccount;
          this.subscriptions.add(
            this.delegateService.delegates.pipe(take(1)).subscribe((d) => {
              this.delegates = this.filter(d).sort((x, y) => (x.address === this.activeAccount?.delegate ? -1 : y === this.activeAccount?.delegate ? 1 : 0));
            })
          );
        }
      })
    );

    this.subscriptions.add(
      this.delegateService.delegates.subscribe((d) => {
        this.delegates = this.filter(d).sort((x, y) => (x.address === this.activeAccount?.delegate ? -1 : y === this.activeAccount?.delegate ? 1 : 0));
      })
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  filter(delegates: any): any[] | null {
    if (delegates?.length) {
      const balanceXTZ = this.activeAccount ? Math.ceil(this.activeAccount.balanceXTZ / 1000000) : 0;
      return delegates
        .map((d) => {
          console.log(d);
          try {
            if (
              d.freeSpace > balanceXTZ &&
              d.estimatedRoi >= 0 &&
              d.openForDelegation === true &&
              d.minDelegation < balanceXTZ &&
              d.serviceType !== 'exchange' &&
              d.serviceHealth !== 'closed'
            ) {
              return d;
            }
          } catch {
            return null;
          }
          return null;
        })
        .filter((obj) => obj);
    }
    return [];
  }
  stake(delegate: any): void {
    if (delegate.address === '' || (this.inputValidationService.validDelegationAddress(delegate.address) && delegate.address !== this.activeAccount.address)) {
      ModalComponent.currentModel.next({
        name: 'delegate-confirm',
        data: delegate
      });
    } else {
      this.messageServcie.addError(`Invalid baker address: ${delegate?.address}`);
    }
  }

  round(val): string {
    return Math.round(Number(val)).toString();
  }

  toPercent(val): string {
    return parseFloat((Number(val) * 100).toFixed(2)).toString() + '%';
  }

  toggleCustom(): void {
    this.isShowingCustom = this.isShowingCustom ? false : true;
  }
}
