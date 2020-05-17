import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from '../../constants';

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
  path: string;
  pendingLedgerConfirmation = false;
  isHDDerivationPathCustom = false;

  constructor(
    private router: Router,
    private ledgerService: LedgerService,
    private importService: ImportService,
    private messageService: MessageService,
    private inputValidationService: InputValidationService
    ) { }

  ngOnInit() {
    this.path = this.defaultPath;
  }
  async getPk() {
    if (this.inputValidationService.derivationPath(this.path)) {
      this.messageService.add('Please verify the public key hash on your Ledger device to continue!');
      this.pendingLedgerConfirmation = true;
      try {
        const pk = await this.ledgerService.getPublicAddress(this.path);
        console.log('getPK => ' + pk);
        await this.importFromPk(pk, this.path);
      } catch (e) {
        throw(e);
      } finally {
        this.pendingLedgerConfirmation = false;
      }
    } else {
      this.messageService.addWarning('Invalid derivation path');
    }
  }
  async importFromPk(pk: string, path: string) {
    if (utils.validPublicKey(pk)) {
      if (await this.importService.importWalletFromPk(pk, path)) {
      this.router.navigate(['/overview']);
      } else {
        this.messageService.addError('Failed to import Ledger wallet');
      }
    } else {
      this.messageService.addError('Not a valid public key');
    }
  }
  setDefaultPath() {
    if (this.isHDDerivationPathCustom) {
      this.path = this.defaultPath;
    }
  }
}
