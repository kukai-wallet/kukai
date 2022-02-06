// general imports
import { TestBed, getTestBed } from '@angular/core/testing';

// class under inspection
import { TruncatePipe } from './truncate.pipe';

/**
 * Suite: TruncatePipe
 */
describe('[ TruncatePipe ]', () => {
  let injector: TestBed;
  let pipe: TruncatePipe;
  let mocktz1: string;

  beforeEach(() => {
    // store injectors to call during tests
    injector = getTestBed();
    pipe = new TruncatePipe();
    mocktz1 = 'tz1bDXD6nNSrebqmA1bKzwnX3QdePSMCj4MX';
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  //transform(value?: string, args?: number, endTrail?: boolean): string
  // Note: doesn't handle null values or negative numbers
  describe('{ should transform truncating a string}', () => {
    it('returns a string', () => {
      expect(pipe.transform('utils.Timeout')).toEqual(jasmine.any(String));
    });

    it('returns truncated string ((3) char prefix limit & no post-fix', () => {
      expect(pipe.transform(mocktz1, 3, false)).toEqual('tz1...');
    });

    it('returns truncated string ((3) char limit pre-fix & post-fix', () => {
      expect(pipe.transform(mocktz1, 3, true)).toEqual('tz1...4MX');
    });
  });
});
