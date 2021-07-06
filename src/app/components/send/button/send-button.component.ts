import { Component, OnInit, Input } from '@angular/core';
import { Account } from '../../../services/wallet/wallet';
import { TokenService } from '../../../services/token/token.service';
import { SubjectService } from '../../../services/subject/subject.service';

@Component({
  selector: 'app-send-button',
  templateUrl: './send-button.component.html',
  styleUrls: ['../../../../scss/components/send/send.component.scss']
})

export class SendButtonComponent implements OnInit {
  @Input() activeAccount: Account;
  @Input() tokenTransfer: string;
  @Input() symbol: string;
  asset = null;
  constructor(
    public tokenService: TokenService,
    private subjectService: SubjectService
  ) { }

  ngOnInit() {
    this.asset = this.tokenService.getAsset(this.tokenTransfer)
  }
  prepareTransaction() {
    this.subjectService.prepareTokenTransfer.next({ account: this.activeAccount, tokenTransfer: this.tokenTransfer, symbol: this.symbol });
  }
}
