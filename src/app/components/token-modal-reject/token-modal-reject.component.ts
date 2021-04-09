import { Component, Input, OnInit } from '@angular/core';
import { TokenResponseType } from '../../../../src/app/services/token/token-interfaces';
import { TokenService } from '../../../../src/app/services/token/token.service';

@Component({
  selector: 'app-token-modal-reject',
  templateUrl: './token-modal-reject.component.html',
  styleUrls: ['./token-modal-reject.component.scss']
})
export class TokenModalRejectComponent implements OnInit {
  @Input() token: TokenResponseType;
  modalOpen = false;

  constructor(
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
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
  onModal() {
    this.openModal();
  }
  onRejectToken() {
    this.tokenService.setRejected(this.token.contractAddress, this.token.id);
    this.closeModal();
  }
}
