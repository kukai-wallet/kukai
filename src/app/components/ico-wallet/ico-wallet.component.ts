import { Component, OnInit } from '@angular/core';
import { ImportService } from '../../services/import.service';
import { Router } from '@angular/router';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-ico-wallet',
  templateUrl: './ico-wallet.component.html',
  styleUrls: ['./ico-wallet.component.scss']
})
export class IcoWalletComponent implements OnInit {

  mnemonic: string;
  email: string;
  pwd: string;

  constructor(
    private importService: ImportService,
    private router: Router,
    private messageService: MessageService) { }

  ngOnInit() {
  }

  retrieve() {
    console.log(this.mnemonic, this.email, this.pwd);
    if (this.importService.importTgeWallet(this.mnemonic, this.email, this.pwd)) {
      this.router.navigate(['/overview']);
    } else {
      this.messageService.add('Failed to import wallet!');
    }
  }

}
