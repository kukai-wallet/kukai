import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  constructor(private walletService: WalletService,
              private router: Router) { }

  ngOnInit() {
    if (this.walletService.wallet.identity) {
      this.router.navigate(['/overview']);
    }
  }

}
