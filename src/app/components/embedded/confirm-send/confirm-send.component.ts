import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { TemplateRequest, TemplateFee, FullyPreparedTransaction } from '../../send/interfaces';
import { Template, BaseTemplate } from 'kukai-embed';
import { WalletService } from '../../../services/wallet/wallet.service';
import { MessageService } from '../../../services/message/message.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-send-embed',
  templateUrl: './confirm-send.component.html',
  styleUrls: ['./confirm-send.component.scss']
})
export class ConfirmSendEmbedComponent implements OnInit, OnChanges {

  @Input() templateRequest: TemplateRequest = null;
  @Output() isApproved = new EventEmitter();
  @Input() activeAccount = null;
  active = false;
  showMore = false;
  template = 'default';
  constructor(public walletService: WalletService, public messageService: MessageService) { }

  ngOnInit(): void {
    this.messageService.origin.pipe(take(1)).subscribe((origin) => {
      console.log(origin);
      if (origin.indexOf('minterpop') !== -1) {
        this.template = 'minterpop';
      } else {
        this.template = 'default';
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.templateRequest?.currentValue) {
      console.log(this.templateRequest);
      if ((<BaseTemplate>this.templateRequest?.template)?.descriptions?.length) {
        this.hideScrollbar();
        this.active = true;
      } else {
        console.warn('No template descriptions');
        this.cancel();
      }
    }
  }
  cancel() {
    this.reset();
    this.isApproved.emit(null);
  }
  approve() {
    if (this.templateRequest.ops && this.templateRequest.fee) {
      this.isApproved.emit(this.templateRequest.ops);
      this.reset();
    }
  }
  toggle() {
    if (this.templateRequest.ops) {
      this.showMore = !this.showMore;
    }
  }
  reset() {
    this.resetScrollbar();
    this.active = false;
  }
  hideScrollbar() {
    const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
    document.body.style.marginRight = scrollBarWidth.toString();
    document.body.style.overflow = 'hidden';
  }
  resetScrollbar() {
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
  }
}

