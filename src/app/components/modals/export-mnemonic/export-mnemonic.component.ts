import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../services/message/message.service';
import { WalletService } from '../../../services/wallet/wallet.service';
import { ModalComponent } from '../modal.component';
import { ExportedSocialWallet, TorusWallet } from '../../../services/wallet/wallet';

@Component({
  selector: 'app-export-mnemonic',
  templateUrl: './export-mnemonic.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class ExportMnemonicComponent extends ModalComponent implements OnInit {
  name = 'export-mnemonic';
  mnemonicPhrase = '';
  ledgerError = '';
  pwdInvalid = '';
  pwd = '';
  hideBlur = false;
  isSelectedMnemonic = false;
  isSocialWallet = false;
  constructor(public walletService: WalletService, private messageService: MessageService) {
    super();
    if (this.walletService.wallet) {
      if (this.walletService.wallet instanceof TorusWallet) {
        this.isSocialWallet = true;
      }
    }
  }

  ngOnInit(): void {}

  closeModal(): void {
    this.reset();
    ModalComponent.currentModel.next({ name: '', data: null });
  }

  async reveal(): Promise<void> {
    try {
      this.messageService.startSpinner();
      this.mnemonicPhrase = await this.walletService.revealMnemonicPhrase(this.pwd);
      this.pwdInvalid = this.mnemonicPhrase === '' ? 'INVALID PASSWORD' : '';
      this.messageService.stopSpinner();
    } catch {
      this.pwdInvalid = this.mnemonicPhrase === '' ? 'INVALID PASSWORD' : '';
    }
  }

  async revealSocial(): Promise<void> {
    try {
      this.pwdInvalid = '';
      this.messageService.startSpinner();
      this.mnemonicPhrase = await this.walletService.revealSocialMnemonicPhrase();
      if (!this.mnemonicPhrase) {
        this.pwdInvalid = 'Authentication failed!';
      }
      this.messageService.stopSpinner();
    } catch (e) {
      this.messageService.stopSpinner();
      console.error(e);
      throw new Error('Failed to reveal social mnemonic');
    }
  }

  mouseOut(e): void {
    e.stopPropagation();
    this.hideBlur = false;
    window.getSelection()?.removeAllRanges();
  }
  checkSelection(ev): void {
    ev.stopPropagation();
    if (this.isTextSelected()) {
      this.isSelectedMnemonic = true;
    }
  }
  private isTextSelected(): boolean {
    let selection: Selection;
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.getSelection) {
      selection = document.getSelection();
    } else return false;
    return !selection?.isCollapsed;
  }
  reset(): void {
    this.mnemonicPhrase = '';
    this.ledgerError = '';
    this.pwdInvalid = '';
    this.pwd = '';
    this.hideBlur = false;
    this.isSelectedMnemonic = false;
  }
}
