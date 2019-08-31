import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from '../../constants';

import { LedgerService } from '../../services/ledger.service';
import { ImportService } from '../../services/import.service';
import { MessageService } from '../../services/message.service';
import { InputValidationService } from '../../services/input-validation.service';

@Component({
  selector: 'app-connect-ledger',
  templateUrl: './connect-ledger.component.html',
  styleUrls: ['./connect-ledger.component.scss']
})
export class ConnectLedgerComponent implements OnInit {
  activePanel = 0;
  CONSTANTS = new Constants();
  path = '44\'/1729\'/0\'/0\'';
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
    if (this.CONSTANTS.NET.NAME !== 'Mainnet') {
      this.path = '44\'/1729\'/1\'/0\'';
    }
  }
  async getPk() {
    if (this.inputValidationService.derivationPath(this.path)) {
      this.messageService.add('Please verify the public key hash on your Ledger device to continue!');
      this.pendingLedgerConfirmation = true;
      try {
        const pk = await this.ledgerService.getPublicAddress(this.path);
        console.log('getPK => ' + pk);
        this.importFromPk(pk, this.path);
      } catch (e) {
        throw(e);
      } finally {
        this.pendingLedgerConfirmation = false;
      }
    } else {
      this.messageService.addWarning('Invalid derivation path');
    }
  }
  importFromPk(pk: string, path: string) {
    if (pk.slice(0, 4) === 'edpk') {
      this.importService.importWalletFromPk(pk, path);
      this.router.navigate(['/overview']);
    } else {
      this.messageService.addError('Somthing went wrong with pk');
    }
  }
  setDefaultPath() {
    if (this.isHDDerivationPathCustom) {
      this.path = '44\'/1729\'/0\'/0\'';
    }
  }
}
