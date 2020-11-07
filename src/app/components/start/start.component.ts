import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { ActivatedRoute } from '@angular/router';
import { DeeplinkService } from '../../services/deeplink/deeplink.service';
import 'rxjs/add/operator/filter';
import { Location } from '@angular/common';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {
  constructor(
    private walletService: WalletService,
    public translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private deeplinkService: DeeplinkService,
    private location: Location,
  ) {
  }
  animationActive = true;

  async ngOnInit() {
    this.route.queryParams
      .filter(params => params.type)
      .subscribe(params => {
        this.deeplinkService.set(params);
        this.location.replaceState('');
      }
    );
    if (this.walletService.wallet) {
      this.router.navigate(['/accounts']);
    }
  }
}
