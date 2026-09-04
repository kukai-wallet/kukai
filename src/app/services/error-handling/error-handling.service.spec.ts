// general imports
import { TestBed, getTestBed } from '@angular/core/testing';

// class under inspection
import { ErrorHandlingService } from './error-handling.service';

/**
 * Suite: ErrorHandlingService
 */
describe('[ ErrorHandlingService ]', () => {
  let injector: TestBed;
  let pipe: ErrorHandlingService;

  beforeEach(() => {
    // store injectors to call during tests
    injector = getTestBed();
    pipe = new ErrorHandlingService();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('{ should transform errorId to message }', () => {
    it("match failure, returns ['Id not known:' + errorId]", () => {
      const errorId = 'hi';
      expect(pipe.transform(errorId)).toEqual('Unrecognized error: ' + errorId);
    });

    it('match success, timeout errorID returns string', () => {
      expect(pipe.transform('utils.Timeout')).toEqual('Timeout');
    });

    it('maps Tezos X node errors to readable messages', () => {
      expect(pipe.transform('evm_node.dev.insufficient_fees')).toEqual('Fee too low for this network. Please re-estimate and try again.');
      expect(pipe.transform('evm_node.dev.tezlink.outdated_operation')).toEqual(
        'Operation expired: it references a block that is too old (older than about 4 minutes). Please try again.'
      );
      expect(pipe.transform('evm_node.dev.tezlink.unsupported_manager_operation')).toEqual('This operation kind is not supported on Tezos X.');
    });
  });
});
