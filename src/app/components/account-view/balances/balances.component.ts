import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Account } from '../../../services/wallet/wallet';
import { CONSTANTS } from '../../../../environments/environment';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['../../../../scss/components/account-view/cards/balances/balances.component.scss'],
})
export class BalancesComponent implements OnInit {
  Object = Object;
  @Input() account: Account;
  tokenTezos = { symbol: 'tez', thumbnailAsset: '../../../../assets/img/tezos-xtz-logo.svg', displayAsset: '../../../../assets/img/tezos-xtz-logo.svg'};
  contractAliases = CONSTANTS.CONTRACT_ALIASES;

  constructor(
    public tokenBalancesService: TokenBalancesService
  ) {}
  
  ngOnInit(): void {}
  trackToken(index: number, token: any) {
    return token?.contractAddress ? token.contractAddress + ':' + token?.id + ':' + token?.balance : null;
  }
}

