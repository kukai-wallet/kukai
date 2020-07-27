import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from '../../constants';
import { WalletService } from '../../services/wallet/wallet.service';
import { LedgerService } from '../../services/ledger/ledger.service';
import { ImportService } from '../../services/import/import.service';
import { MessageService } from '../../services/message/message.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { utils } from '@tezos-core-tools/crypto-utils';

@Component({
  selector: 'app-connect-ledger',
  templateUrl: './connect-ledger.component.html',
  styleUrls: ['./connect-ledger.component.scss']
})
export class ConnectLedgerComponent implements OnInit {
  activePanel = 0;
  CONSTANTS = new Constants();
  defaultPath = '44\'/1729\'/0\'/0\'';
  defaultText = 'Default derivation path';
  path: string;
  pendingLedgerConfirmation = false;
  isHDDerivationPathCustom = false;

  constructor(
    private router: Router,
    private ledgerService: LedgerService,
    private importService: ImportService,
    private messageService: MessageService,
    private inputValidationService: InputValidationService,
    private walletService: WalletService
    ) { }

  ngOnInit() {
    this.path = this.defaultText;
  }
  async getPk() {
    const path: string = this.path.replace(this.defaultText, this.defaultPath);
    if (this.inputValidationService.derivationPath(path)) {
      this.pendingLedgerConfirmation = true;
      try {
        this.messageService.startSpinner('Waiting for Ledger confirmation...');
        const pk = await this.ledgerService.getPublicAddress(path);
        console.log('getPK => ' + pk);
        await this.importFromPk(pk, path);
      } catch (e) {
        throw(e);
      } finally {
        this.pendingLedgerConfirmation = false;
        this.messageService.stopSpinner();
      }
    } else {
      this.messageService.addWarning('Invalid derivation path');
    }
  }
  async importFromPk(pk: string, path: string) {
    if (utils.validPublicKey(pk)) {
      if (await this.importService.importWalletFromPk(pk, path)) {
        if (this.walletService.wallet.implicitAccounts.length === 1 && this.walletService.wallet.implicitAccounts[0].originatedAccounts.length === 0) {
          this.router.navigate([`/account/${this.walletService.wallet.implicitAccounts[0].address}`]);
        } else {
          this.router.navigate(['/accounts']);
        }
      } else {
        this.messageService.addError('Failed to import Ledger wallet');
      }
    } else {
      this.messageService.addError('Not a valid public key');
    }
  }
  setDefaultPath() {
    if (this.isHDDerivationPathCustom) {
      this.path = this.defaultText;
    } else {
      this.path = this.defaultPath;
    }
  }
}
