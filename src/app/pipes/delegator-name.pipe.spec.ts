// general imports
import { TestBed, getTestBed } from '@angular/core/testing';

// class under inspection
import { DelegatorNamePipe } from './delegator-name.pipe';
import { BAKERSLIST } from '../../data/bakers-list';

/**
 * Suite: DelegatorNamePipe
 */
describe('[ DelegatorNamePipe ]', () => {
	let injector: TestBed;
	let pipe: DelegatorNamePipe;

	beforeEach(() => {
		// store injectors to call during tests
		injector = getTestBed();
		pipe = new DelegatorNamePipe();
	});

	it('create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	describe('{ should import bakers array }', () => {

		it('create an instance, bakers array', () => {
			expect(BAKERSLIST).toBeTruthy();
		});

		it('array size is greater than zero', () => {
			expect(BAKERSLIST.length).toBeGreaterThan(0);
		});

		it('identities prefixed tz1 & length 36', () => {
			let result = true;

			BAKERSLIST.forEach((baker: any) => {
				if (!((new RegExp('^tz[1-3]{1}[a-zA-Z0-9]{33}$')).test(baker.identity))) {
					console.log('Invalid identity: ' + baker.identity);
					result = false;
				}
			});

			expect(result).toBeTruthy();
		});
	});

	describe('{ should transform address to name }', () => {
		it('match failure, null arg returns empty string', () => {
			// providing no pkh should return empty string
			expect(pipe.transform(null)).toEqual('');
		});

		it('match failure, implicit arg returns pkh string', () => {
			expect(pipe.transform('tz1XD4TuLXVjtqaE17B3GJ2cjfp4KzbpxQs1')).toEqual('tz1XD4TuLXVjtqaE17B3GJ2cjfp4KzbpxQs1');
		});

		it('match success, implicit arg returns name string', () => {
			expect(pipe.transform('tz3e75hU4EhDU3ukyJueh5v6UvEHzGwkg3yC')).toEqual('At James');
		});
	});
});
