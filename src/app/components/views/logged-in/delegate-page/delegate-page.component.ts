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
  balanceXTZ = 0;
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
          this.balanceXTZ = this.activeAccount ? this.activeAccount.balanceXTZ / 1000000 : 0;
          this.subscriptions.add(
            this.delegateService.delegates.pipe(take(1)).subscribe((d) => {
              this.delegates = this.filter(d);
            })
          );
        }
      })
    );

    this.subscriptions.add(
      this.delegateService.delegates.subscribe((d) => {
        this.balanceXTZ = this.activeAccount ? this.activeAccount.balanceXTZ / 1000000 : 0;
        this.delegates = this.filter(d);
      })
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  filter(delegates: any): any[] | null {
    if (delegates?.length) {
      const del = delegates.filter((d) => {
        try {
          if (
            d.estimatedRoi >= 0 &&
            d.openForDelegation === true &&
            d.minDelegation < this.balanceXTZ &&
            d.serviceType !== 'exchange' &&
            d.serviceHealth !== 'closed' &&
            d.serviceHealth !== 'dead'
          ) {
            return d;
          }
        } catch {
          return;
        }
      });
      const d2 = del.filter((d) => d.freeSpace < this.balanceXTZ).sort((a, b) => b.freeSpace - a.freeSpace);
      const d1 = del.filter((d) => d.freeSpace >= this.balanceXTZ).sort((a, b) => b.estimatedRoi - a.estimatedRoi);
      return [...d1, ...d2].sort((x, y) => (x.address === this.activeAccount?.delegate ? -1 : y === this.activeAccount?.delegate ? 1 : 0));
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
