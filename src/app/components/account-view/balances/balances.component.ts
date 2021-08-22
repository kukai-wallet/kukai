import { AfterViewInit, Component, HostListener, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Account } from '../../../services/wallet/wallet';
import { CONSTANTS } from '../../../../environments/environment';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['../../../../scss/components/account-view/cards/balances/balances.component.scss'],
})
export class BalancesComponent implements OnInit, AfterViewInit {
  Object = Object;
  @Input() account: Account;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;

  constructor(
    public tokenBalancesService: TokenBalancesService
  ) {
  }
  ngOnInit(): void {
  }
  ngAfterViewInit() {
    const wrap = document.querySelector('.balances') as HTMLElement;
    wrap.addEventListener('scroll', (e) => {
      if(wrap.scrollTop > 0) {
        document.querySelector('.scroll-wrapper .tez').classList.add('no-box');
      } else {
        document.querySelector('.scroll-wrapper .tez').classList.remove('no-box');
      }

    });
  }
  trackToken(index: number, token: any) {
    return token?.contractAddress ? token.contractAddress + ':' + token?.id + ':' + token?.balance : null;
  }
}

