import { Component, Input, OnInit } from '@angular/core';
import { TokenResponseType, TokenService } from '../../../../src/app/services/token/token.service';

@Component({
  selector: 'app-token-metadata',
  templateUrl: './token-metadata.component.html',
  styleUrls: ['./token-metadata.component.scss']
})
export class TokenMetadataComponent implements OnInit {
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

  onTrust() {
    this.tokenService.setTrusted(this.token.contractAddress, this.token.id, true)
    this.closeModal()
  }
}
