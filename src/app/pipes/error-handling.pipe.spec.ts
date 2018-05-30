import { ErrorHandlingPipe } from './error-handling.pipe';

describe('ErrorHandlingPipe', () => {
    it('create an instance', () => {
        const pipe = new ErrorHandlingPipe();
        expect(pipe).toBeTruthy();
    });
});
