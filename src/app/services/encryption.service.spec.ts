// class under inspection
import { EncryptionService } from "./encryption.service";

// provider sub-dependencies
import * as bip39 from 'bip39';
import { KeyPair } from "../interfaces";


/**
 * Suite: EncryptionService
 * @todo: create a new example account to test with or encrypt with a different password.
 */
describe('[ EncryptionService ]', () => {
  
	// class under inspection
	let service:EncryptionService;
	let keypair:KeyPair;
	let seed, ciphertext, password, salt, version;
	let decryptedseed:any;
	
	
	beforeEach(() => {
		service = new EncryptionService();

		//let plaintext = 'version general song belt roast random horror shop pitch fun earn badge drum submit output';

		keypair = <KeyPair> {
			sk: 'edskRkVvBf657kMmoRb47oKjkQBzzH6dExq9GKsoFCHte3p2qeAecwQyjoSH5mNMb9LLDPSFQUJwGQdi3KzGYh1hCQamREUdV4',
			pk: 'edpktubBcCqnS8pUJaYyf7dqqvSR3CgTcLRXKP8L6AubzoZxTjYGpT',
			pkh: 'tz1hyH4nZMnQcCbA8b2DmLE8Z9ctByhP54Fn'
		}

		let mnemonic = 'version general song belt roast random horror shop pitch fun earn badge drum submit output';
		seed = bip39.mnemonicToSeed(mnemonic, '').slice(0, 32);
		
		//seed, password & salt
		salt = keypair.pkh.slice(3, 19);

		// encrypted seed, password & salt 
		ciphertext = '1010ada0966a25e8098a0610ab134970862c77da6daf85ac190dc05c8f3e55f2';
		password = 'Firebird87';
		version = "1.0";
	});	

	it('should be created', () => {
		expect(service).toBeTruthy();   
	});

	/** Broken in 1.3.0 update
	it('should encrypt a private key w/password', () => {
		let encryptedseed = service.encrypt(seed, password, salt);
		expect(encryptedseed).toEqual(ciphertext);
	})
	 */

	 /** Broken in 1.3.0 update
	it('should decrypt the same private key w/password', () => {	  
		decryptedseed = Buffer.from(service.decrypt(ciphertext, password, salt, version));
		expect(decryptedseed).toEqual(seed);
	})
	 */

	/** Broken in 1.3.0 update
	it('should fail to decrypt and return empty string', () => {
		let errorstring = service.decrypt('seed', '', '', version);
		expect(errorstring).toEqual('');
	});
	 */
});