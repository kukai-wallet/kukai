import { Component, OnInit, Input } from '@angular/core';
import Big from 'big.js';
import { TokenResponseType } from '../..//services/token/token.service';
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
  constructor() {
  }
  ngOnInit(): void {
  }
  listDisplayText(): string {
    if (this.token.isNft) {
      return this.token.name;
    } else {
      const tokenBalance = this.account.getTokenBalance(`${this.token.contractAddress}:${this.token.id}`);
      return Big(tokenBalance).div(10 ** this.token.decimals).toString() + ' ' + this.token.symbol;
    }
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
  }
  getDescription(): string {
    return this.token.description ? this.token.description : '—';
  }
}
