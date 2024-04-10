import { Component, OnDestroy, OnInit, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { CustomFee, DefaultTransactionParams } from '../../../../../interfaces';
import { EstimateService } from '../../../../../services/estimate/estimate.service';
import { InputValidationService } from '../../../../../services/input-validation/input-validation.service';
import Big from 'big.js';

@Component({
  selector: 'app-custom-fee',
  templateUrl: './custom-fee.component.html',
  styleUrls: ['../../../../../../scss/components/modals/modal.scss']
})
export class CustomFeeComponent implements OnInit, OnDestroy {
  @Input() defaultFee: DefaultTransactionParams;
  customFee: CustomFee;
  maxStorageCost = 0;
  @Output() customFeeChange: EventEmitter<CustomFee> = new EventEmitter<CustomFee>();

  constructor(private estimateService: EstimateService, private inputValidationService: InputValidationService) {}
  ngOnInit(): void {
    this.customFee = {
      gas: '',
      storage: '',
      fee: ''
    };
  }
  ngOnDestroy(): void {
    // console.log('destroy custom fee component');
  }

  keyPressNumbersDecimal(event, input): void {
    let tmp = event.target.value;
    if (input === 'customFee.fee') {
      tmp = tmp.replace(/[^0-9\.]/g, '');
      if ((tmp.match(/\./g) || []).length > 1) {
        tmp = tmp.split('');
        tmp.splice(tmp.lastIndexOf('.'), 1);
        tmp = tmp.join('');
      }
      if (tmp.charAt(0) === '.') {
        tmp = '0' + tmp;
      }
    } else {
      tmp = tmp.replace(/[^0-9]/g, '');
    }
    event.target.value = tmp;
    if (input.includes('.')) {
      this[input.split('.')[0]][input.split('.')[1]] = tmp;
    } else {
      this[input] = tmp;
    }
    this.maxStorageCost = this.burnAmount();
    this.customFeeChange.emit(this.customFee);
  }
  burnAmount(): number | null {
    const burn =
      this.customFee?.storage && this.inputValidationService.storage(this.customFee.storage.toString())
        ? Big(this.customFee.storage).times(this.estimateService.costPerByte).div(1000000)
        : this.defaultFee.burn;
    if (burn) {
      return burn;
    }
    return null;
  }
}
