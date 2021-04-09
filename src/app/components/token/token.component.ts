import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { TokenResponseType, TokenStatus } from '../../../../src/app/services/token/token-interfaces';
import { CONSTANTS } from '../../../../src/environments/environment';
import { TokenService } from '../../services/token/token.service';
import { ImplicitAccount } from '../../services/wallet/wallet';
import { TokenModalRejectComponent } from '../token-modal-reject/token-modal-reject.component';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit {
  @Input() account: ImplicitAccount;
  @Input() token: TokenResponseType;
  @ViewChild(TokenModalRejectComponent) tokenModalReject: TokenModalRejectComponent;

  balance = '';
  modalOpen = false;
  fullSize = false;
  toggleShowHidePreviewImg = false;

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
    this.toggleShowHidePreviewImg = false;
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
  isTokenPending(token) {
    return token.tokenStatus === TokenStatus.PENDING;
  }
  onTrust(isTrust: boolean) {
    if (isTrust) {
      this.tokenService.setTrusted(this.token.contractAddress, this.token.id);
    } else {
      this.tokenModalReject.openModal();
      return;
    }
    this.closeModal();
  }
  onToggleShowHidePreviewImg() {
    this.toggleShowHidePreviewImg = !this.toggleShowHidePreviewImg;
  }
}
