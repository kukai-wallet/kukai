import { Component, OnInit } from '@angular/core';

import { TorusService } from '../../services/torus/torus.service';
import { ImportService } from '../../services/import/import.service';
import { MessageService } from '../../services/message/message.service';
import { Router } from '@angular/router';
import { WalletService } from '../../services/wallet/wallet.service';

@Component({
  selector: 'app-torus',
  templateUrl: './torus.component.html',
  styleUrls: ['./torus.component.scss']
})
export class TorusComponent implements OnInit {
  activeLogin = 'google';
  constructor(
    private walletService: WalletService,
    public torusService: TorusService,
    private importService: ImportService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.torusService.initTorus();
  }
  async torusLogin(verifier: string) {
    await this.messageService.startSpinner('Loading wallet...');
    const { keyPair, userInfo } = await this.torusService.loginTorus(verifier).catch(async (e) =>
      await this.messageService.stopSpinner()
    );
    console.log('login done');
    if (keyPair) {
      await this.importService
        .importWalletFromPk(keyPair.pk, '', { verifier: userInfo.typeOfLogin, id: userInfo.verifierId, name: userInfo.name })
        .then((success: boolean) => {
          if (success) {
            console.log('success');
            if (this.walletService.wallet.implicitAccounts.length === 1 && this.walletService.wallet.implicitAccounts[0].originatedAccounts.length === 0) {
              console.log('single address');
              this.router.navigate([`/account/${this.walletService.wallet.implicitAccounts[0].address}`]);
            } else {
              this.router.navigate(['/accounts']);
            }
            this.messageService.stopSpinner();
          } else {
            this.messageService.addError('Torus import failed');
            this.messageService.stopSpinner();
          }
        });
    } else {
      await this.messageService.stopSpinner();
    }
  }
  mobile(): boolean {
    return (window.innerWidth < 480);
  }
}
