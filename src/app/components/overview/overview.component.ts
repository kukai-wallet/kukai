import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { FaucetService } from '../../services/faucet.service';
import { BalanceService } from '../../services/balance.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  constructor(
    private walletService: WalletService,
    private faucetService: FaucetService,
    private messageService: MessageService,
    private balanceService: BalanceService) { }

  ngOnInit() {
    if (this.walletService.wallet.identity) {
      this.balanceService.getBalanceAll();
    }
  }
  addAccount() {
    // this.walletService.createAccount();
  }
  async freeTezzies(pkh: string) {
    if (await this.faucetService.freeTezzies(pkh)) {
      this.balanceService.getIdentityBalance();
    }
  }
}
