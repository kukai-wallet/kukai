import { TestBed } from '@angular/core/testing';

import { ConfirmSendComponent } from './send-confirmation.component';
import { AppModule } from '../../../../app.module';
import { LoggedInModule } from '../../../../components/views/logged-in/logged-in.module';

const input1 = [
  {
    add_operator: {
      owner: 'tz1WXDeZmSpaCCJqes9GknbeUtdKhJJ8QDA2',
      operator: 'KT18iSHoRW1iogamADWwQSDoZa3QkN4izkqj',
      token_id: '847564736475869586758675'
    }
  }
];

const input11 = {
  __michelsonType: 'list',
  schema: {
    __michelsonType: 'or',
    schema: {
      add_operator: {
        __michelsonType: 'pair',
        schema: {
          owner: {
            __michelsonType: 'address',
            schema: 'address'
          },
          operator: {
            __michelsonType: 'address',
            schema: 'address'
          },
          token_id: {
            __michelsonType: 'bytes',
            schema: 'bytes'
          }
        }
      },
      remove_operator: {
        __michelsonType: 'pair',
        schema: {
          owner: {
            __michelsonType: 'address',
            schema: 'address'
          },
          operator: {
            __michelsonType: 'address',
            schema: 'address'
          },
          token_id: {
            __michelsonType: 'bytes',
            schema: 'bytes'
          }
        }
      }
    }
  }
};

const output1 = [
  {
    key: 'add_operator',
    children: [
      {
        key: 'owner',
        val: 'tz1WXDeZmSpaCCJqes9GknbeUtdKhJJ8QDA2',
        children: []
      },
      {
        key: 'operator',
        val: 'KT18iSHoRW1iogamADWwQSDoZa3QkN4izkqj',
        children: []
      },
      {
        key: 'token_id',
        val: '�udsdu���u�u',
        children: []
      }
    ]
  }
];

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
    let result = comp.componentInstance.parametersToTabular(input1, input11);
    expect(JSON.stringify(result)).toEqual(JSON.stringify(output1));
  });
});
