import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../services/message/message.service';
import { WalletService } from '../../../services/wallet/wallet.service';
import { ModalComponent } from '../modal.component';

@Component({
  selector: 'app-export-mnemonic',
  templateUrl: './export-mnemonic.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class ExportMnemonicComponent extends ModalComponent implements OnInit {
  title = 'Reveal Seed Words';
  name = 'export-mnemonic';
  mnemonicPhrase = '';
  ledgerError = '';
  pwdInvalid = '';
  pwd = '';
  hideBlur = false;
  isSelectedMnemonic = false;
  constructor(public walletService: WalletService, private messageService: MessageService) {
    super();
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
      this.pwdInvalid = this.mnemonicPhrase === '' ? 'INVLAID PASSWORD' : '';
      this.messageService.stopSpinner();
    } catch {
      this.pwdInvalid = this.mnemonicPhrase === '' ? 'INVLAID PASSWORD' : '';
    }
  }

  mouseOut(e) {
    e.stopPropagation();
    this.hideBlur = false;
    window.getSelection()?.removeAllRanges();
  }
  checkSelection(ev) {
    ev.stopPropagation();
    if (this.isTextSelected()) {
      this.isSelectedMnemonic = true;
    }
  }
  private isTextSelected() {
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
