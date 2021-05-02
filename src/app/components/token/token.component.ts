import { Component, OnInit, Input } from '@angular/core';
import Big from 'big.js';
import { TokenService, TokenResponseType } from '../../services/token/token.service';
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
      return (this.tokenService.searchTimeMs(tokenKey) > 150000) ? this.token.name : 'Searching for metadata...';
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
}
