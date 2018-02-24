import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['./new-wallet.component.scss']
})
export class NewWalletComponent implements OnInit {
  @Input() pwd = '';
  activePanel = 0;
  data = {
    seed: '',
    salt: ''
  };
  constructor(private walletService: WalletService,
    private messageService: MessageService) { }

  ngOnInit() {
  }
  generateSeed() {
    this.activePanel++;
    this.data.seed = this.walletService.createNewWallet();
  }
  pwdView() {
    this.activePanel++;
  }
  async encryptWallet() {
    this.data = this.walletService.encryptWallet(this.pwd);
    // this.messageService.add('Pwd: ' + this.pwd);
    this.pwd = '';
    this.activePanel++;
  }
  async decryptWallet() {
    this.walletService.decryptWallet(this.pwd);
    this.pwd = '';
    this.activePanel++;
  }
  reset() {
    this.activePanel = 0;
  }
}
