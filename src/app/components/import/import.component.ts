import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { ImportService } from '../../services/import.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  activePanel = 0;
  @Input() encryptedWallet = '';
  data = {
    seed: '',
    salt: ''
  };
  constructor(private walletService: WalletService,
    private router: Router,
    private messageService: MessageService,
    private importService: ImportService) { }

  ngOnInit() {
  }
  import() {
    if (this.importService.importWalletData(this.encryptedWallet)) {
      this.router.navigate(['/accounts']);
    } else {
      this.messageService.add('Failed to import wallet!');
    }
  }
}
