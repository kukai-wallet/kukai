import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { TemplateRequest, TemplateFee, FullyPreparedTransaction } from '../interfaces';
import { EstimateService } from '../../../services/estimate/estimate.service';
import Big from 'big.js';

@Component({
  selector: 'app-confirm-send-template',
  templateUrl: './confirm-send-template.component.html',
  styleUrls: ['./confirm-send-template.component.scss']
})
export class ConfirmSendTemplateComponent implements OnInit, OnChanges {
  @Input() templateRequest: TemplateRequest = null;
  @Output() isApproved = new EventEmitter();
  active = false;
  constructor(
    private estimateService: EstimateService
  ) { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.templateRequest?.currentValue && !changes.templateRequest.previousValue) {
      if (this.templateRequest.template.description) {
        this.hideScrollbar();
        if (this.templateRequest.template.description[0] && typeof this.templateRequest.template.description[0] === 'string') {
          this.templateRequest.template.description[0] = { text: this.templateRequest.template.description[0] };
        }
        if (this.templateRequest.template.description[2] && typeof this.templateRequest.template.description[2] === 'string') {
          this.templateRequest.template.description[2] = { text: this.templateRequest.template.description[2] };
        }
        this.active = true;
      } else {
        this.isApproved.emit(null);
      }
    }
  }
  cancel() {
    this.reset();
    this.isApproved.emit(null);
  }
  approve() {
    this.isApproved.emit(this.templateRequest.ops);
    this.reset();
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

