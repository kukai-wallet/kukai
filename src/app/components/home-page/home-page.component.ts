import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  constructor(private walletService: WalletService,
    private messageService: MessageService,
    private router: Router) { }

  ngOnInit() {
  }
  logout() {
    this.walletService.clearWallet();
  }
}
