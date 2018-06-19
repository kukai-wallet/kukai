import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

    isMobile = false;
    isTouchScreen = false;
    screenWidth: number;

    constructor(
        private walletService: WalletService,
        private router: Router
        ) {
            this.screenWidth = window.screen.width;
        }

    ngOnInit() {
        if (this.walletService.wallet) {
        this.router.navigate(['/overview']);
        }

        this.isTouchScreen = this.isMobileDevice();
        console.log('this.isMobile ', this.isTouchScreen);

        if (this.screenWidth <= 767.98) {
            console.log('this.screenWidth ', this.screenWidth);
            this.isMobile = true;
        }
    }

    // From: https://coderwall.com/p/i817wa/one-line-function-to-detect-mobile-devices-with-javascript
    isMobileDevice() {
        return (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }

}
