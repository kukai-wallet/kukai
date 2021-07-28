import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../services/wallet/wallet.service';
import { DelegateService } from '../../services/delegate/delegate.service';
import { ModalComponent } from '../modal/modal.component';


@Component({
  selector: 'app-delegate-page',
  templateUrl: './delegate-page.component.html',
  styleUrls: ['../../../scss/components/delegate/delegate.component.scss']
})
export class DelegatePageComponent implements OnInit {
  delegates = [];
  activeAccount = null;
  customAddress = "";
  isShowingCustom = false;

  constructor(
    public delegateService: DelegateService,
    public router: Router,
    public walletService: WalletService
  ) {
  }

  async ngOnInit() {
    this.walletService.activeAccount.subscribe(activeAccount => {
      if (this.activeAccount !== activeAccount) {
        this.activeAccount = activeAccount;
      }
    });

    this.delegateService.delegates.subscribe((d) => {
      this.delegates = this.filter(d);
    })
  }

  filter(delegates: any) {
    if (delegates?.length) {
      const balanceXTZ = this.activeAccount ? Math.ceil(this.activeAccount.balanceXTZ / 1000000) : 0;
      return delegates.map((d) => {
        try {
          if (d.freeSpace > balanceXTZ && d.estimatedRoi > 0 && d.openForDelegation === true) {
            return d;
          }
        } catch {
          return null;
        }
        return null;
      }).filter(obj => obj);
    }
    return [];
  }
  stake(delegate) {
    ModalComponent.currentModel.next({ name: 'delegate-confirm', data: delegate });
  }

  round(val): string {
    return Math.round(Number(val)).toString();
  }

  toPercent(val): string {
    return parseFloat((Number(val) * 100).toFixed(2)).toString() + '%';
  }

  toggleCustom() {
    this.isShowingCustom = this.isShowingCustom ? false : true;
  }
}