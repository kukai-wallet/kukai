// general imports
import { TestBed, getTestBed } from '@angular/core/testing';

// class under inspection
import { ErrorHandlingPipe } from './error-handling.pipe';

/**
 * Suite: ErrorHandlingPipe
 */
describe('[ ErrorHandlingPipe ]', () => {
	let injector: TestBed;
	let pipe: ErrorHandlingPipe;
	
	beforeEach(() => {		
		// store injectors to call during tests
		injector = getTestBed();
		pipe = new ErrorHandlingPipe();
	});

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
	});

	describe('{ should transform errorId to message }', () => {

		it('match failure, returns [\'Id not known:\' + errorId]', () => {
			let errorId = 'hi';
			expect(pipe.transform(errorId)).toEqual('Id not known: ' + errorId);
		});

		it('match success, timeout errorID returns string', () => {
			expect(pipe.transform('utils.Timeout')).toEqual('Timeout');
		});
		
		
	});
}); 
