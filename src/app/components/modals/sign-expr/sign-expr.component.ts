import { Component, OnInit, SimpleChanges, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import { MessageService } from '../../../services/message/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Account } from '../../../services/wallet/wallet';
import { OperationService } from '../../../services/operation/operation.service';
import { emitMicheline } from '@taquito/michel-codec';
import { valueDecoder } from '@taquito/local-forging/dist/lib/michelson/codec';
import { Uint8ArrayConsumer } from '@taquito/local-forging/dist/lib/uint8array-consumer';
import { LedgerService } from '../../../services/ledger/ledger.service';
import { InputValidationService } from '../../../services/input-validation/input-validation.service';
import { ModalComponent } from '../modal.component';
import { Subscription } from 'rxjs';
import { SubjectService } from '../../../services/subject/subject.service';

@Component({
  selector: 'app-sign-expr',
  templateUrl: './sign-expr.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class SignExprComponent extends ModalComponent implements OnInit, OnChanges {
  @Input() signRequest: any;
  @Input() activeAccount: Account;
  @Output() signResponse = new EventEmitter();
  syncSub: Subscription;
  password = '';
  pwdInvalid = '';
  payload = '';
  isMessage = false;
  advancedForm = false;
  name = 'sign-expr';
  constructor(
    public walletService: WalletService,
    private messageService: MessageService,
    public translate: TranslateService,
    private operationService: OperationService,
    private ledgerService: LedgerService,
    private inputValidationService: InputValidationService,
    private subjectService: SubjectService
  ) { super(); }
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.signRequest) {
      ModalComponent.currentModel.next({name:this.name, data:null});
      this.isMessage = this.inputValidationService.isMessageSigning(this.signRequest.payload);
      const value = valueDecoder(Uint8ArrayConsumer.fromHexString(this.signRequest.payload.slice(2)));
      const payload = emitMicheline(value, { indent: '  ', newline: '\n' });
      this.payload = this.isMessage ? value.string : payload;
      this.syncSub = this.subjectService.beaconResponse.subscribe((response) => {
        if (response) {
          this.signResponse.emit('silent');
          this.closeModal();
        }
      });
    }
  }
  async sign(): Promise<void> {
    if (this.walletService.isLedgerWallet()) {
      this.requestLedgerSignature();
    } else {
      const pwd = this.password;
      this.password = '';
      await this.messageService.startSpinner(`Signing ${this.isMessage ? 'message' : 'payload'}...`);
      let keys;
      try {
        keys = await this.walletService.getKeys(pwd, this.activeAccount.pkh);
      } catch (e) {
        console.warn(e);
        this.messageService.stopSpinner();
      }
      if (keys) {
        this.pwdInvalid = '';
        try {
          const signature = this.operationService.sign(this.signRequest.payload, keys.sk).edsig;
          this.acceptSigning(signature);
        } catch (e) {
          this.pwdInvalid = 'Signing failed';
          console.warn(e);
        } finally {
          this.messageService.stopSpinner();
        }
      } else {
        this.messageService.stopSpinner();
        if (this.walletService.isTorusWallet()) {
          this.pwdInvalid = `Authorization failed`;
        } else {
          this.pwdInvalid = this.translate.instant('SENDCOMPONENT.WRONGPASSWORD');
        }
      }
    }
  }
  async requestLedgerSignature(): Promise<void> {
    await this.messageService.startSpinner('Waiting for Ledger signature...');
    try {
      const payload = this.signRequest.payload;
      let signature = '';
      if (payload.length <= 2290) {
        signature = await this.ledgerService.signOperation(payload, this.walletService.wallet.implicitAccounts[0].derivationPath);
      } else {
        signature = await this.ledgerService.signHash(this.operationService.ledgerPreHash(payload), this.walletService.wallet.implicitAccounts[0].derivationPath);
      }
      if (signature) {
        this.acceptSigning(this.operationService.hexsigToEdsig(signature));
      } else {
        this.pwdInvalid = 'Failed to sign transaction';
      }
    } finally {
      this.messageService.stopSpinner();
    }
  }
  rejectSigning(): void {
    this.closeModal();
    this.signResponse.emit(null);
  }
  acceptSigning(signature: string): void {
    this.messageService.addSuccess(this.isMessage ? 'Message signed!' : 'Payload signed!');
    this.closeModal();
    this.signResponse.emit(signature);
  }
  closeModal(): void {
    ModalComponent.currentModel.next({name:'', data:null});
    this.clear();
  }
  clear(): void {
    this.password = '';
    this.pwdInvalid = '';
    this.payload = '';
    this.isMessage = false;
    if (this.syncSub) {
      this.syncSub.unsubscribe();
      this.syncSub = undefined;
    }
  }
}