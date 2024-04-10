import { Component, OnDestroy, OnInit, Input, SimpleChanges } from '@angular/core';
import Big from 'big.js';

@Component({
  selector: 'app-operations-display',
  templateUrl: './operations-display.component.html',
  styleUrls: []
})
export class OperationsDisplayComponent implements OnInit, OnDestroy {
  @Input() operations: [any];
  operationsDisplay: string = '';

  ngOnInit(): void {}
  ngOnDestroy(): void {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.operations?.currentValue?.length) {
      let ops = structuredClone(changes.operations.currentValue);
      this.sanitize(ops);
      this.mutezToTez(ops);
      this.operationsDisplay = this.prettify(ops);
      //this.operationsDisplay = this.
    } else {
      this.operationsDisplay = '';
    }
  }
  private sanitize(ops: any) {
    for (var i = 0; i < ops.length; i++) {
      delete ops[i].fee;
      delete ops[i].counter;
      delete ops[i].gas_limit;
      delete ops[i].storage_limit;
    }
    return ops;
  }
  private mutezToTez(ops: any) {
    for (let op of ops) {
      if (op?.amount) {
        op.amount = `${Big(op.amount).div(1000000).toFixed()} tez`;
      }
      if (op?.balance) {
        op.balance = `${Big(op.balance).div(1000000).toFixed()} tez`;
      }
    }
    return ops;
  }
  prettify(ops: any) {
    return JSON.stringify(ops, null, 2);
  }
}
