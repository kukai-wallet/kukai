// general imports
import { TestBed, getTestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

// class under inspection
import { TimeAgoPipe } from './time-ago.pipe';

/**
 * Suite: TimeAgoPipe
 */
describe('[ TimeAgoPipe ]', () => {
	let injector: TestBed;
	let pipe: TimeAgoPipe;
	let translate: TranslateService;
	let date: Date;

	beforeEach(() => {
		TestBed.configureTestingModule({
		  imports: [ TranslateModule.forRoot( { loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }) ],
		  providers: [ TranslateService ]
		});

		// store injectors to call during tests
		injector = getTestBed();
		translate = injector.inject(TranslateService);
		pipe = new TimeAgoPipe(translate);
		date = new Date();
	});

	// spec: expect instantiation
    it('create an instance', () => {
        expect(pipe).toBeTruthy();
	});

	// suite: transform method
	describe('{ should transform string date to ??string}', () => {

		const testdate = '2018-12-24T11:25:23Z';
		const testdate2 = '2018-12-24';


		//yesterday.setDate(currentDate.getDate()-1);
		//console.log(yesterday.toDateString())

		// spec: except spied method called
		it('should be called', () => {
			// create spy
			spyOn(pipe, 'transform');

			// call transform method
			pipe.transform(null);

			// expect it was called
			expect(pipe.transform).toHaveBeenCalled();
		});

		it('should return a string ', () => {
			expect(pipe.transform(date.getTime())).toEqual(jasmine.any(String));
		});

		it('should return timeago data given offset date', () => {
			const expectedResult = date.getHours() + ' TIMEAGOPIPE.HOURS ' + date.getMinutes() + ' TIMEAGOPIPE.MINUTE TIMEAGOPIPE.AGO';
			console.log(date.getTime());
			expect(pipe.transform(Number(new Date(date.toDateString())))).toEqual(expectedResult);
		});
	});
});
