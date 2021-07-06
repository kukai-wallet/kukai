import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
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
    private delegateService: DelegateService,
    public router: Router,
    public walletService: WalletService
  ) {
  }

  async ngOnInit() {
    this.walletService.activeAccount.subscribe(activeAccount => {
      if (this.activeAccount !== activeAccount) {
        this.activeAccount = activeAccount;
        this.filter();
      }
    });

    this.delegateService.delegates.subscribe((d) => {
      this.delegates = d;
    })
  }

  filter() {
    if (!!this.delegates.length && !!this.activeAccount) {
      this.delegates = this.delegates.map((d) => {
        try {
          if (d.freeSpace > 0 && d.estimatedRoi > 0 && d.openForDelegation === true) {
            return d;
          }
        } catch {
          return null;
        }
        return null;
      }).filter(obj => obj);
    }
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