// class under inspection
import { MessageService } from './message.service';

// provider sub-dependencies
import { TestBed } from '@angular/core/testing';

/**
 * Suite: MessageService
 */
describe('[ MessageService ]', () => {

	// class under inspection
	let service: MessageService;

	// vars
	let type: string;
	let message: string;

	// testing data
	const seconds = 15;
	const infomsg = { type: 'info', msg: 'informational message', timeout: seconds * 1000 };
	const errormsg = { type: 'danger', msg: 'error message', timeout: seconds * 1000 };
	const warningmsg = { type: 'warning', msg: 'warning message', timeout: seconds * 1000 };
	const successmsg = { type: 'success', msg: 'success message', timeout: seconds * 1000 };

	beforeEach(() => {
    	TestBed.configureTestingModule({
      		providers: [MessageService]
    	});

		service = TestBed.inject(MessageService);

		// reset message queue
		service.messages = [];

		// do nothing on console logging
		spyOn(console, 'log');

	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should create message object array', () => {
		const messages = service.messages;
		expect(messages instanceof Array).toBeTruthy();
	});

	it('should push an information message', () => {
		// set message type and value
		message = 'informational message';
		type = 'info';

		service.add(message, seconds);

		expect(infomsg).toEqual(service.messages.pop());
		expect(console.log).toHaveBeenCalledWith(type + ': ' + message);
	});

	it('should push an error message', () => {
		// set message type and value
		message = 'error message';
		type = 'danger';

		service.addError(message, seconds);

		expect(errormsg).toEqual(service.messages.pop());
		expect(console.log).toHaveBeenCalledWith(type + ': ' + message);
	});

	it('should push an warning message', () => {
		// set message type and value
		message = 'warning message';
		type = 'warning';

		service.addWarning(message, seconds);

		expect(warningmsg).toEqual(service.messages.pop());
		expect(console.log).toHaveBeenCalledWith(type + ': ' + message);
	});

	it('should push an success message', () => {
		// set message type and value
		message = 'success message';
		type = 'success';

		service.addSuccess(message, seconds);

		expect(successmsg).toEqual(service.messages.pop());
		expect(console.log).toHaveBeenCalledWith(type + ': ' + message);
	});

	it('should clear queue of (3) messages', () => {
		// set message value
		message = 'filler message';

		// add multiple messages to the queue
		service.add(message, seconds);
		service.add(message, seconds);
		service.add(message, seconds);

		expect(service.messages.length).toEqual(3);

		service.clear();

		expect(service.messages.length).toEqual(0);
	});
});
