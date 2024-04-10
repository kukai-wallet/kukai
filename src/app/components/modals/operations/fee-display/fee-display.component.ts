import { Component, OnDestroy, OnInit, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { CustomFee, DefaultTransactionParams } from '../../../../interfaces';
import { EstimateService } from '../../../../services/estimate/estimate.service';
import { InputValidationService } from '../../../../services/input-validation/input-validation.service';
import Big from 'big.js';

@Component({
  selector: 'app-fee-display',
  templateUrl: './fee-display.component.html',
  styleUrls: ['../../../../../scss/components/modals/modal.scss']
})
export class FeeDisplayComponent implements OnInit, OnDestroy {
  @Input() defaultFee: DefaultTransactionParams;
  advancedForm = false;
  @Output() customFeeChange: EventEmitter<CustomFee> = new EventEmitter<CustomFee>();

  constructor(private estimateService: EstimateService, private inputValidationService: InputValidationService) {}
  ngOnInit(): void {}
  ngOnDestroy(): void {
    // console.log('destroy fee component');
  }
  onCustomFeeChange(customFee: CustomFee) {
    this.customFeeChange.emit(customFee);
  }
}
