import { Component, OnInit, SimpleChanges, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { MessageService } from '../../../../services/message/message.service';
import { TranslateService } from '@ngx-translate/core';
import { Account } from '../../../../services/wallet/wallet';
import { OperationService } from '../../../../services/operation/operation.service';
import { emitMicheline } from '@taquito/michel-codec';
import { valueDecoder } from '@taquito/local-forging/dist/lib/michelson/codec';
import { Uint8ArrayConsumer } from '@taquito/local-forging/dist/lib/uint8array-consumer';
import { InputValidationService } from '../../../../services/input-validation/input-validation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-expr-embed',
  templateUrl: './sign-expr.component.html',
  styleUrls: ['./sign-expr.component.scss']
})
export class SignExprEmbedComponent implements OnInit, OnChanges {
  @Input() signRequest: any;
  @Input() activeAccount: Account;
  @Output() signResponse = new EventEmitter();
  syncSub: Subscription;
  password = '';
  pwdInvalid = '';
  payload = '';
  template = null;
  description = null;
  isMessage = false;
  showMore = false;
  constructor(
    public walletService: WalletService,
    private messageService: MessageService,
    public translate: TranslateService,
    private operationService: OperationService,
    private inputValidationService: InputValidationService
  ) { }
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.signRequest) {
      const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
      document.body.style.marginRight = scrollBarWidth.toString();
      document.body.style.overflow = 'hidden';
      this.template = this.signRequest.ui;
      this.isMessage = this.inputValidationService.isMessageSigning(this.signRequest.payload);
      const value = valueDecoder(Uint8ArrayConsumer.fromHexString(this.signRequest.payload.slice(2)));
      const payload = emitMicheline(value, { indent: '  ', newline: '\n' });
      this.payload = this.isMessage ? value.string : payload;
    }
  }
  async sign() {
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
  rejectSigning() {
    this.closeModal();
    this.signResponse.emit(null);
  }
  acceptSigning(signature: string) {
    this.messageService.addSuccess(this.isMessage ? 'Message signed!' : 'Payload signed!');
    this.closeModal();
    this.signResponse.emit(signature);
  }
  closeModal() {
    // restore body scrollbar
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    this.clear();
  }
  clear() {
    this.password = '';
    this.pwdInvalid = '';
    this.payload = '';
    this.isMessage = false;
    this.template = null;
  }
  toggle() {
    this.showMore = !this.showMore;
  }
  handleTemplateApproval(t) {
    if (t) {
      this.sign();
    } else {
      this.rejectSigning();
    }
  }
}
