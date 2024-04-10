import { Component, OnDestroy, OnInit, Input, Output, SimpleChanges, EventEmitter, inject, Inject } from '@angular/core';
import { KeyPair, CustomFee, DefaultTransactionParams, ExternalRequest } from '../../../../interfaces';
import { MessageService } from '../../../../services/message/message.service';
import { OperationService } from '../../../../services/operation/operation.service';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { LedgerWallet, Account, TorusWallet, ImplicitAccount } from '../../../../services/wallet/wallet';
import { LedgerService } from '../../../../services/ledger/ledger.service';
import { Subscription } from 'rxjs';
import { emitMicheline, assertMichelsonData } from '@taquito/michel-codec';
import { InputValidationService } from '../../../../services/input-validation/input-validation.service';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['../../../../../scss/components/modals/modal.scss']
})
export class SignComponent implements OnInit, OnDestroy {
  @Input() bytes: string;
  @Input() account: Account;
  @Output() signature = new EventEmitter<string>();
  @Output() signedBytes = new EventEmitter<string>();

  public messageService = inject(MessageService);
  private ledgerService = inject(LedgerService);
  private operationService = inject(OperationService);
  public walletService = inject(WalletService);

  readonly wrongPasswordErrorMessage: string = 'Wrong password!';
  password: string = '';
  errorMessage: string = '';

  //private subscriptions: Subscription = new Subscription();

  constructor(private inputValidationService: InputValidationService) {}
  ngOnInit(): void {}
  ngOnDestroy(): void {
    // console.log('destroy sign component');
    //this.subscriptions.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log('sign-op changes', changes);
  }
  public async sign() {
    const _bytes = this.bytes;
    if (this.invalidInput()) {
      return;
    }
    // Can be signed in 4 ways. Keystore, Ledger, Social and read-only (dummy signature?)
    if (this.walletService.isPwdWallet() || this.walletService.isTorusWallet()) {
      this.messageService.startSpinner();
      try {
        const keys = await this.walletService.getKeys(this.password, this.account.pkh);
        if (!keys) {
          this.errorMessage = this.walletService.isPwdWallet() ? this.wrongPasswordErrorMessage : 'Authorization failed';
          throw new Error('Authorization failed');
        }
        const signed = this.operationService.sign(_bytes, keys.sk);
        // console.log('signed', signed);
        this.signature.emit(signed.edsig);
        this.signedBytes.emit(signed.sbytes);
      } catch (e) {
        console.error(e);
      } finally {
        this.messageService.stopSpinner();
      }
    } else if (this.walletService.isLedgerWallet()) {
      this.messageService.startSpinner();
      try {
        const signature = await this.getLedgerSignature(_bytes);
        const prefixedSig = this.operationService.sig2prefixedSig(signature);
        // console.log('prefixed', prefixedSig);
        this.signature.emit(prefixedSig);
        this.signedBytes.emit(_bytes.slice(2) + signature);
      } catch (e) {
        console.error(e);
        this.errorMessage = 'Failed to sign';
      } finally {
        this.messageService.stopSpinner();
      }
    } else if (this.walletService.isWatchWallet()) {
      this.signature.emit('edsigtXomBKi5CTRf5cjATJWSyaRvhfYNHqSUGrn4SdbYRcGwQrUGjzEfQDTuqHhuA8b2d8NarZjz8TRf65WkpQmo423BtomS8Q');
    } else {
      throw new Error('Unsupported wallet type');
    }
  }
  async getLedgerSignature(bytes: string): Promise<string> {
    if (this.account instanceof ImplicitAccount && this.account.derivationPath) {
      let signature = '';
      if (bytes.length <= 2290 && bytes.startsWith('03')) {
        signature = await this.ledgerService.signOperation(bytes, this.account.derivationPath);
      } else {
        signature = await this.ledgerService.signHash(this.operationService.ledgerPreHash(bytes), this.account.derivationPath);
      }
      if (signature) {
        return signature;
      }
    }
    throw new Error('No signature');
  }
  private invalidInput(): boolean {
    this.errorMessage = '';
    if (!this.bytes) {
      this.errorMessage = 'No bytes to sign';
    } else if (!this.inputValidationService.hexString(this.bytes)) {
      this.errorMessage = 'Invalid hex string';
    } else if (!this.inputValidationService.address(this.account?.address)) {
      this.errorMessage = 'Invalid account';
    }
    return Boolean(this.errorMessage);
  }
  public pwdTyping() {
    if (this.errorMessage === this.wrongPasswordErrorMessage) {
      this.errorMessage = '';
    }
  }
}
