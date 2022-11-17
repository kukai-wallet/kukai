import { TestBed } from '@angular/core/testing';

import { ConfirmSendComponent } from './send-confirmation.component';
import { AppModule } from '../../../../app.module';
import { LoggedInModule } from '../../../../components/views/logged-in/logged-in.module';

let input1 = {
  swaps: [
    {
      operation: {
        b_to_a: Symbol()
      },
      pair_id: '7'
    }
  ],
  amount_in: '558057547761',
  min_amount_out: '1354157',
  receiver: 'tz1WXDeZmSpaCCJqes9GknbeUtdKhJJ8QDA2',
  deadline: '2022-09-16T15:50:34.284Z'
};

let input2 = [
  {
    int: '100'
  },
  {
    int: '100'
  },
  {
    int: '100'
  }
];

let input3 = '300';

let output1 = [
  {
    key: 'swaps',
    children: [
      {
        key: 'operation',
        children: [
          {
            key: 'b_to_a',
            val: Symbol(),
            children: []
          }
        ]
      },
      {
        key: 'pair_id',
        val: '7',
        children: []
      }
    ]
  },
  {
    key: 'amount_in',
    val: '558057547761',
    children: []
  },
  {
    key: 'min_amount_out',
    val: '1354157',
    children: []
  },
  {
    key: 'receiver',
    val: 'tz1WXDeZmSpaCCJqes9GknbeUtdKhJJ8QDA2',
    children: []
  },
  {
    key: 'deadline',
    val: '2022-09-16T15:50:34.284Z',
    children: []
  }
];
let output2 = [
  { key: 'int', val: '100', children: [] },
  { key: 'int', val: '100', children: [] },
  { key: 'int', val: '100', children: [] }
];
let output3 = [{ key: null, val: '300', children: [] }];

describe('ConfirmSendComponent', () => {
  let comp: ConfirmSendComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmSendComponent],
      imports: [AppModule, LoggedInModule]
    }).compileComponents();
  });

  it('parametersToTabular', async () => {
    const comp = TestBed.createComponent(ConfirmSendComponent);
    let result = comp.componentInstance.parametersToTabular(input1);
    expect(JSON.stringify(result)).toEqual(JSON.stringify(output1));
    result = comp.componentInstance.parametersToTabular(input2);
    expect(JSON.stringify(result)).toEqual(JSON.stringify(output2));
    result = comp.componentInstance.parametersToTabular(input3);
    expect(JSON.stringify(result)).toEqual(JSON.stringify(output3));
  });
});
