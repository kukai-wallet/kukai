import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LedgerService } from '../../../../../services/ledger/ledger.service';
import { ImportService } from '../../../../../services/import/import.service';
import { MessageService } from '../../../../../services/message/message.service';
import { InputValidationService } from '../../../../../services/input-validation/input-validation.service';
import { WalletService } from '../../../../../services/wallet/wallet.service';
import { utils } from '../../../../../libraries/index';
import { LedgerWallet } from '../../../../../services/wallet/wallet';

@Component({
  selector: 'app-connect-ledger',
  templateUrl: './connect-ledger.component.html',
  styleUrls: ['../../../../../../scss/components/views/start/login.component.scss']
})
export class ConnectLedgerComponent implements OnInit {
  activePanel = 0;
  defaultPath = "44'/1729'/0'/0'";
  defaultText = 'Account Discovery (recommended)';
  path: string;
  isHDDerivationPathCustom = false;
  browser = 'unknown';

  constructor(
    private router: Router,
    private ledgerService: LedgerService,
    private importService: ImportService,
    private messageService: MessageService,
    private inputValidationService: InputValidationService,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.path = this.defaultText;
    this.checkBrowser();
  }
  checkBrowser(): void {
    try {
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        this.browser = 'firefox';
      } else if ((navigator as any)?.userAgentData?.brands?.some((b) => b.brand === 'Google Chrome' || 'Chromium')) {
        this.browser = 'chromium';
      } else if ((navigator as any)?.userAgent.toLowerCase().indexOf('safari') > -1 && navigator.platform.indexOf('Mac') === -1) {
        this.browser = 'safari';
      }
    } catch (e) {
      console.warn(e);
    }
  }
  async getPk(): Promise<void> {
    const path: string = this.path.replace(this.defaultText, this.defaultPath);
    if (this.inputValidationService.derivationPath(path)) {
      try {
        this.messageService.startSpinner('Waiting for Ledger confirmation...');
        if (!this.isHDDerivationPathCustom) {
          // account scanning
          const accounts = await this.ledgerService.scan();
          await this.importFromPk(accounts[0].pk, accounts[0].path);
          accounts.shift();
          while (accounts.length) {
            const account = accounts.shift();
            this.walletService.addImplicitAccount(account.pk, account.path);
          }
        } else {
          const pk = await this.ledgerService.getPublicAddress(path);
          await this.importFromPk(pk, path);
        }
      } catch (e) {
        throw e;
      } finally {
        this.messageService.stopSpinner();
      }
    } else {
      this.messageService.addWarning('Invalid derivation path');
    }
  }
  async importFromPk(pk: string, path: string): Promise<Boolean> {
    if (utils.validPublicKey(pk)) {
      if (await this.importService.importWalletFromPk(pk, path)) {
        this.router.navigate([`/account/`]);
        return true;
      } else {
        this.messageService.addError('Failed to import Ledger wallet');
      }
    } else {
      this.messageService.addError('Not a valid public key');
    }
    return false;
  }
  setDefaultPath(v): void {
    if (this.isHDDerivationPathCustom) {
      this.path = this.defaultText;
    } else {
      this.path = this.defaultPath;
    }
    this.isHDDerivationPathCustom = v;
  }
}
