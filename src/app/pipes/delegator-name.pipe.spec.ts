// general imports
import { TestBed, getTestBed } from '@angular/core/testing';

// class under inspection
import { DelegatorNamePipe } from './delegator-name.pipe';

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

	describe('{ should build a map }', () => {

		it('create an instance, delegate map', () => {		
			expect(pipe.map).toBeTruthy();
		});

		it('map size is greater than zero', () => {
			expect(pipe.map.size).toBeGreaterThan(0);
		});

		it('map keys prefixed tz1 & length 36', () => {
			let result: boolean = true;
	
			pipe.map.forEach((value: string, key: string) => {
				if (!((new RegExp('^tz[1-3]{1}[a-zA-Z0-9]{33}$')).test(key))) { result = false; };
			});
	
			expect(result).toBeTruthy();
		})
	})

	describe('{ should transform address to name }', () => {
		it('match failure, null arg returns empty string', () => {
			// providing no pkh should return empty string
			expect(pipe.transform(null)).toEqual('');
		});

		it('match failure, implicit arg returns pkh string', () => {
			expect(pipe.transform('tz1XD4TuLXVjtqaE17B3GJ2cjfp4KzbpxQs1')).toEqual('tz1XD4TuLXVjtqaE17B3GJ2cjfp4KzbpxQs1');
		});		

		it('match success, implicit arg returns name string', () => {
			expect(pipe.transform('tz1fP9PoNWMpAaiPcBEb1gqQTskUAFNDiWD4')).toEqual('Tezocracy');
		});
	});
});
