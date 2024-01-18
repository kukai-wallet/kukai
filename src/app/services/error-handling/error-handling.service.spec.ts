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
  });
});
