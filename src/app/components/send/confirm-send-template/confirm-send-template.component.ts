import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { TemplateRequest, TemplateFee, FullyPreparedTransaction } from '../interfaces';

@Component({
  selector: 'app-confirm-send-template',
  templateUrl: './confirm-send-template.component.html',
  styleUrls: ['./confirm-send-template.component.scss']
})
export class ConfirmSendTemplateComponent implements OnInit, OnChanges {
  @Input() templateRequest: TemplateRequest = null;
  @Output() isApproved = new EventEmitter();
  active = false;
  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.templateRequest?.currentValue) {
      console.log(this.templateRequest);
      if (this.templateRequest.template?.descriptions?.length) {
        this.hideScrollbar();
        this.active = true;
      } else {
        console.log('No template descriptions');
        this.isApproved.emit(null);
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

