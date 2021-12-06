import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { WalletService } from '../../../../../services/wallet/wallet.service';

@Component({
  selector: 'app-sign-expr-template',
  templateUrl: './template.component.html',
  styleUrls: ['../../confirm-send/confirm-send.component.scss']
})
export class ExprTemplateComponent implements OnInit, OnChanges {
  @Input() req = null;
  @Output() isApproved = new EventEmitter();
  constructor(
    public walletService: WalletService
  ) {}

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
  }
  cancel() {
    this.isApproved.emit(false);
  }
  approve() {
    this.isApproved.emit(true);
  }
}