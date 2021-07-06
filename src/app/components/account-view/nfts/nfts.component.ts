import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Account, ImplicitAccount } from '../../../services/wallet/wallet';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../services/message/message.service';
import { TokenService } from '../../../services/token/token.service';
import { CONSTANTS } from '../../../../environments/environment';
import { ModalComponent } from '../../modal/modal.component';
import { WalletService } from '../../../services/wallet/wallet.service';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-nfts',
  templateUrl: './nfts.component.html',
  styleUrls: ['../../../../scss/components/account-view/cards/nfts.component.scss'],
})
export class NftsComponent implements OnInit, AfterViewInit {
  Object = Object;
  Number = Number;
  contracts = {};
  filter: string = 'APP';
  contractAliases = CONSTANTS.CONTRACT_ALIASES;
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public tokenService: TokenService,
    private walletService: WalletService,
    public tokenBalancesService: TokenBalancesService
  ) { }
  @Input() activity: any;
  @Input() account: Account;
  ngOnInit(): void {
    // this.tokenBalancesService.tokenReload.pipe(debounceTime(200)).subscribe(() => {
    //   const _nfts = this.tokenBalancesService.nfts;
    //   if (this.Object.keys(_nfts)?.length > 0) {
    //     let _filter = Object.keys(_nfts)?.reduce((stored, key) => (_nfts[key]?.tokens.length > _nfts[stored]?.tokens.length && _nfts[key]?.tokens.length > 9) ? key : stored);
    //     this.filter = this.tokenBalancesService.nfts[_filter]?.tokens.length > 9 ? _filter : 'ALL';
    //   }
    // });
  }
  ngAfterViewInit() {
    // var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
    // if ("IntersectionObserver" in window) {
    //   let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
    //     entries.forEach(function (entry) {
    //       if (entry.isIntersecting) {
    //         let lazyImage: HTMLImageElement = entry.target as HTMLImageElement;
    //         lazyImage.src = lazyImage.dataset.src;
    //         lazyImage.srcset = lazyImage.dataset.srcset;
    //         lazyImage.classList.remove("lazy");
    //         lazyImageObserver.unobserve(lazyImage);
    //       }
    //     });
    //   });
    //   lazyImages.forEach(function (lazyImage) {
    //     lazyImageObserver.observe(lazyImage);
    //   });
    // }
  }
  displayTokenCard(): boolean {
    return (this.account instanceof ImplicitAccount) || (this.account?.tokens?.length > 0);
  }
  toggleDropdown(sel) {
    const elem = [].slice.call(document.querySelectorAll(`.nfts .collection`));
    const c = document.querySelector(sel).classList.contains('expanded');
    elem.forEach(token => { if (token.classList.contains('expanded')) { token.classList.toggle('expanded'); token.querySelector('.body').scrollTop = 0; } });
    if (!c) { document.querySelector(sel).classList.toggle('expanded'); }
  }
  viewToken(token) {
    ModalComponent.currentModel.next({ name: 'token-detail', data: token });
  }
}