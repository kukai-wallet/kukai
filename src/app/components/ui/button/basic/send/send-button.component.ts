import { Component, OnInit, Input } from '@angular/core';
import { Account } from '../../../../../services/wallet/wallet';
import { TokenService } from '../../../../../services/token/token.service';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { BasicButtonComponent } from '../basic.component';

@Component({
  selector: 'app-send-button',
  templateUrl: './send-button.component.html',
  styleUrls: ['../../../../../../scss/components/ui/button/send.component.scss']
})
export class SendButtonComponent extends BasicButtonComponent implements OnInit {
  @Input() activeAccount: Account;
  @Input() tokenTransfer: string;
  @Input() symbol: string;
  @Input() override = false;
  asset = null;
  constructor(public tokenService: TokenService, private subjectService: SubjectService) {
    super();
  }

  ngOnInit(): void {
    this.asset = this.tokenService.getAsset(this.tokenTransfer);
  }
  prepareTransaction(): void {
    this.subjectService.prepareTokenTransfer.next({
      account: this.activeAccount,
      tokenTransfer: this.tokenTransfer,
      symbol: this.symbol
    });
  }
}
