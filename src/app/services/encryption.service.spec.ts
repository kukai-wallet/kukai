// class under inspection
import { EncryptionService } from './encryption.service';

// provider sub-dependencies
import * as bip39 from 'bip39';
import { KeyPair } from '../interfaces';


/**
 * Suite: EncryptionService
 * @todo: create a new example account to test with or encrypt with a different password.
 */
describe('[ EncryptionService ]', () => {

	// class under inspection
	let service: EncryptionService;
	let keypair: KeyPair;
	let seed, ciphertext, password, salt, version;
	let decryptedseed: any;
	// let iv: string;

	beforeEach(() => {
		service = new EncryptionService();
		//let plaintext = 'version general song belt roast random horror shop pitch fun earn badge drum submit output';

	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('> Encrypt', () => {

		it('should throw error version 1 encryption', () => {
			expect(function() {
				service.encrypt('plaintext', 'password', 1);
			}).toThrowError('Encryption version no longer supported');
		});

		it('should call encrypt_v2 for version 2 encryption', () => {
			// spy on method it will call based on version 2
			spyOn(service, 'encrypt_v2').and.returnValue('success');

			// expect spy to return 'success' in place of normal encrypt_v2 result
			expect( service.encrypt('plaintext', 'password', 2) ).toBe('success');

			// encrypt_v2 should have been called with plaintext, password params
			expect(service.encrypt_v2).toHaveBeenCalledWith('plaintext', 'password');
		});

		it('should throw error for unrecognized encryption version', () => {
			expect(function() {
				service.encrypt('plaintext', 'password', 3);
			}).toThrowError('Unrecognized encryption format');
		});

	});

	describe('> Decrypt', () => {

		it('should call decrypt_v1 for version 1 encryption', () => {
			// spy on method it will call based on version 1
			spyOn(service, 'decrypt_v1').and.returnValue('success');

			// expect spy to return 'success' in place of normal decrypt_v1 result
			expect( service.decrypt('ciphertext', 'password', 'salt', 1) ).toBe('success');

			// decrypt_v1 should have been called with plaintext, password, salt params
			expect(service.decrypt_v1).toHaveBeenCalledWith('ciphertext', 'password', 'salt');
		});

		it('should call decrypt_v2 for version 2 encryption', () => {
			// spy on method it will call based on version 2
			spyOn(service, 'decrypt_v2').and.returnValue('success');

			// expect spy to return 'success' in place of normal decrypt_v2 result
			expect( service.decrypt('ciphertext', 'password', 'salt', 2) ).toBe('success');

			// decrypt_v1 should have been called with plaintext, password, salt params
			expect(service.decrypt_v2).toHaveBeenCalledWith('ciphertext', 'password', 'salt');
		});

		it('should throw error for unrecognized encryption version', () => {
			expect(function() {
				service.decrypt('ciphertext', 'password', 'salt', 3);
			}).toThrowError('Unrecognized encryption format');
		});

	});

	describe('> Encrypt & Decrypt v1', () => {
		beforeEach(() => {
			keypair = <KeyPair> {
				sk: 'edskRkVvBf657kMmoRb47oKjkQBzzH6dExq9GKsoFCHte3p2qeAecwQyjoSH5mNMb9LLDPSFQUJwGQdi3KzGYh1hCQamREUdV4',
				pk: 'edpktubBcCqnS8pUJaYyf7dqqvSR3CgTcLRXKP8L6AubzoZxTjYGpT',
				pkh: 'tz1hyH4nZMnQcCbA8b2DmLE8Z9ctByhP54Fn'
			};

			const mnemonic = 'version general song belt roast random horror shop pitch fun earn badge drum submit output';
			seed = bip39.mnemonicToSeedSync(mnemonic, '').slice(0, 32);

			//seed, password & salt
			salt = keypair.pkh.slice(3, 19);

			// encrypted seed, password & salt
			ciphertext = '1010ada0966a25e8098a0610ab134970862c77da6daf85ac190dc05c8f3e55f2';
			password = 'Firebird87';
			version = '1.0';
		});
		it('should encrypt_v1 a private key w/password', () => {
			const encryptedseed = service.encrypt_v1(seed, password, salt);
			expect(encryptedseed).toEqual(ciphertext);
		});

		it('should decrypt_v1 the same private key w/password', () => {
			decryptedseed = Buffer.from(service.decrypt_v1(ciphertext, password, salt));
			expect(decryptedseed).toEqual(seed);
		});

		it('should fail to decrypt_v1 and return empty string', () => {
			const errorstring = service.decrypt_v1('seed', '', '');
			expect(errorstring).toEqual('');
		});

	});
	describe('> Encrypt & Decrypt v2', () => {
		beforeEach(() => {
			keypair = <KeyPair> {
				sk: 'edskRkVvBf657kMmoRb47oKjkQBzzH6dExq9GKsoFCHte3p2qeAecwQyjoSH5mNMb9LLDPSFQUJwGQdi3KzGYh1hCQamREUdV4',
				pk: 'edpktubBcCqnS8pUJaYyf7dqqvSR3CgTcLRXKP8L6AubzoZxTjYGpT',
				pkh: 'tz1hyH4nZMnQcCbA8b2DmLE8Z9ctByhP54Fn'
			};
			const mnemonic = 'version general song belt roast random horror shop pitch fun earn badge drum submit output';
			seed = bip39.mnemonicToSeedSync(mnemonic, '').slice(0, 32);
			ciphertext = '1145141c7e2cdd3448b477a6e6e2f4de2ab893f74afddfb26875a2f055628c69==9fd30af5d097d24675e0418220f478cc';
			password = 'Firebird87';
			version = '2';
		});
		it('should encrypt and decrypt a seed successfully', () => {
			const encryptedseed = service.encrypt_v2(seed, password);
			decryptedseed = Buffer.from(service.decrypt_v2(encryptedseed.chiphertext, password, encryptedseed.iv));
			expect(decryptedseed).toEqual(seed);
		});

	});
});
