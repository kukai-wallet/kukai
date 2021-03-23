import { Component, OnInit, Input } from '@angular/core';
import { CONSTANTS } from '../../../../src/environments/environment';
import { TokenService, TokenResponseType, TokenStatus } from '../../services/token/token.service';
import { ImplicitAccount } from '../../services/wallet/wallet';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit {
  @Input() account: ImplicitAccount;
  @Input() token: TokenResponseType;
  balance = '';
  modalOpen = false;
  fullSize = false;
  constructor(
    private tokenService: TokenService
  ) {
  }
  ngOnInit(): void {
  }
  listDisplayText(): string {
    const tokenKey = `${this.token.contractAddress}:${this.token.id}`;
    const tokenBalance = this.account.getTokenBalance(tokenKey);
    if (this.token.name === '[Unknown token]') {
      return (this.tokenService.searchTimeMs(tokenKey) > 90000) ? this.token.name : 'Searching for metadata...';
    }
    return this.tokenService.formatAmount(tokenKey, tokenBalance);
  }
  openModal() {
    console.log('open');
    const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
    document.body.style.marginRight = scrollBarWidth.toString();
    document.body.style.overflow = 'hidden';
    this.modalOpen = true;
  }
  closeModal() {
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    this.modalOpen = false;
    this.fullSize = false;
  }
  getDescription(): string {
    return this.token.description ? this.token.description : '—';
  }
  onTrust(isTrust: boolean) {
    if (isTrust) {
      this.tokenService.setTrusted(this.token.contractAddress, this.token.id)
    } else {
      this.tokenService.setRejected(this.token.contractAddress, this.token.id)
    }
    this.closeModal()
  }
  get getTokenImg() {
    const token = this.token
    const defaultImg = CONSTANTS.DEFAULT_TOKEN_IMG;
    return token.tokenStatus == TokenStatus.APPROVED ? token.thumbnailUrl : defaultImg;
  }
}
