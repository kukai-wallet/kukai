// general imports
import { TestBed, getTestBed } from '@angular/core/testing';

// class under inspection
import { RemoveCommaPipe } from './remove-comma.pipe';

/**
 * Suite: RemoveCommaPipe
 */
describe('[ RemoveCommaPipe ]', () => {
	let injector: TestBed;
	let pipe: RemoveCommaPipe;

	beforeEach(() => {
		// store injectors to call during tests
		injector = getTestBed();
		pipe = new RemoveCommaPipe();
	});

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
	});

	describe('{ should transform remove comma to message }', () => {
		it('removal test', () => {
			expect(pipe.transform('10,000')).toEqual('10000');
		});
	});
});
