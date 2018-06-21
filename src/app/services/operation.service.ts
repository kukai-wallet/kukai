import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { Buffer } from 'buffer';
import * as libs from 'libsodium-wrappers';
import * as Bs58check from 'bs58check';
import * as bip39 from 'bip39';

import { ErrorHandlingPipe } from '../pipes/error-handling.pipe';

export interface KeyPair {
  sk: string | null;
  pk: string | null;
  pkh: string;
}
@Injectable()
export class OperationService {
  nodeURL = 'https://tezrpc.me/zeronet';
  CHAIN_ID = 'ProtoALphaALphaALphaALphaALphaALphaALphaALphaDdp3zK';
  prefix = {
    tz1: new Uint8Array([6, 161, 159]),
    edpk: new Uint8Array([13, 15, 37, 217]),
    edsk: new Uint8Array([43, 246, 78, 7]),
    edsig: new Uint8Array([9, 245, 205, 134, 18]),
    o: new Uint8Array([5, 116]),
  };
  toMicro = 1000000;
  constructor(
    private http: HttpClient,
    private errorHandlingPipe: ErrorHandlingPipe
  ) { }
  /*
    Returns an observable for the activation of an ICO identity
  */
  activate(pkh: string, secret: string): Observable<any> {
    console.log(pkh + ' : ' + secret);
    return this.http.get(this.nodeURL + '/chains/main/blocks/head/hash', {})
      .flatMap((hash: any) => {
        const fop = {
          branch: hash,
          contents: [{
            kind: 'activate_account',
            pkh: pkh,
            secret: secret
          }]
        };
        return this.http.post(this.nodeURL + '/chains/main/blocks/head/helpers/forge/operations', fop)
          .flatMap((opbytes: any) => {
            console.log(opbytes + Array(129).join('0'));
            return this.http.post(this.nodeURL + '/injection/operation', JSON.stringify(opbytes + Array(129).join('0')))
              .flatMap((final: any) => {
                console.log(typeof(final) + '<>' + final.length);
                if (typeof(final) === 'string' && final.length === 51) {
                  return of(
                    {
                      success: true,
                      payload: {
                        opHash: final
                      }
                  });
                } else {
                  return of(
                    {
                      success: false,
                      payload: {
                        opHash: null,
                        msg: final
                      }
                  });
                }
              });
          });
      }).pipe(catchError(err => this.errHandler(err)));
  }
  /*
    Returns an observable for the origination of new accounts.
  */
  originate(pkh: string, amount: number, fee: number = 0, keys: KeyPair): Observable<any> {
    return this.http.post(this.nodeURL + '/chains/main/blocks/head/hash', {})
      .flatMap((hash: string) => {
        console.log(JSON.stringify(hash));
        // GET /chains/<chain_id>/blocks/<block_id>/context/contracts/<contract_id>
        return this.http.get(this.nodeURL + '/chains/main/blocks/head/context/contracts/' + pkh + '/counter', {})
          .flatMap((actions: number) => {
            let counter: number = Number(actions);
            const fop: any = {
              branch: hash,
              // kind: 'manager',
              // source: pkh,
              // fee: (fee * this.toMicro).toString(),
              // counter: ++actions,
              contents: [
                {
                  kind: 'reveal',
                  source: pkh,
                  fee: '0',
                  counter: (++counter).toString(),
                  gas_limit: '0',
                  storage_limit: '60000',
                  public_key: keys.pk
                },
                {
                  kind: 'origination',
                  source: pkh,
                  fee: (fee * this.toMicro).toString(),
                  counter: (++counter).toString(),
                  gas_limit: '0',
                  storage_limit: '60000',
                  managerPubkey: keys.pkh,
                  balance: (amount * this.toMicro).toString(),
                  delegatable: true
                }
              ]
            };
            // /chains/<chain_id>/blocks/<block_id>/helpers/forge/operations
            return this.http.post(this.nodeURL + '/chains/main/blocks/head/helpers/forge/operations', fop)
              .flatMap((opbytes: any) => {
                console.log('opbytes: ' + opbytes);
                if (!keys.sk) { // If sk doesn't exist, return unsigned operation
                  return of(
                    {
                      success: true,
                      payload: {
                        unsignedOperation: opbytes
                      }
                    });
                } else { // If sk exists, sign and broadcast operation
                  // GET /chains/<chain_id>/blocks/<block_id>/header/shell/predecessor
                  return this.http.get(this.nodeURL + '/chains/main/blocks/head/header/', {})
                    .flatMap((header: any) => {
                      console.log('header: ' + JSON.stringify(header.predecessor));
                      const signed = this.sign(opbytes, keys.sk);
                      const sopbytes = signed.sbytes;
                      const opHash = this.b58cencode(libs.crypto_generichash(32, this.hex2buf(sopbytes)), this.prefix.o);
                      /*const aop = {
                        predecessor: header.predecessor,
                        operations_hash: opHash,
                        forged_operation: opbytes,
                        signature: signed.edsig
                      };*/
                      fop.protocol = this.CHAIN_ID;
                      fop.signature = signed.edsig;
                      // POST /chains/<chain_id>/blocks/<block_id>/helpers/preapply/operations
                      return this.http.post(this.nodeURL + '/chains/main/blocks/head/helpers/preapply/operations', [fop])
                        .flatMap((applied: any) => {
                          console.log('applied: ' + JSON.stringify(applied));
                          console.log('sop: ' + sopbytes);
                          return this.http.post(this.nodeURL + '/injection/operation', JSON.stringify(sopbytes))
                            .flatMap((final: any) => {
                              console.log('final: ' + JSON.stringify(final));
                              return of(
                                {
                                  success: true,
                                  payload: {
                                    opHash: final,
                                    newPkh: applied.contracts[0],
                                    unsignedOperation: null
                                  }
                                });
                            });
                        });
                    });
                }
              });
          });
      }).pipe(catchError(err => this.errHandler(err)));
  }
  /*
    Returns an observable for the transaction of tez.
  */
  transfer(from: string, to: string, amount: number, fee: number = 0, keys: KeyPair): Observable<any> {
    return this.http.post(this.nodeURL + '/blocks/head', {})
      .flatMap((head: any) => {
        return this.http.post(this.nodeURL + '/blocks/head/proto/context/contracts/' + from + '/counter', {})
          .flatMap((actions: any) => {
            const fop = {
              branch: head.hash,
              kind: 'manager',
              source: from,
              fee: (fee * this.toMicro).toString(),
              counter: ++actions.counter,
              operations: [
                {
                  kind: 'reveal',
                  public_key: keys.pk
                },
                {
                  kind: 'transaction',
                  amount: (amount * this.toMicro).toString(),
                  destination: to,
                  parameters: {
                    prim: 'Unit',
                    args: []
                  }
                }
              ]
            };
            return this.http.post(this.nodeURL + '/blocks/head/proto/helpers/forge/operations', fop)
              .flatMap((opbytes: any) => {
                if (!keys.sk) { // If sk doesn't exist, return unsigned operation
                  return of(
                    {
                      success: true,
                      payload: {
                        unsignedOperation: opbytes.operation
                      }
                    });
                } else { // If sk exists, sign and broadcast operation
                  return this.http.post(this.nodeURL + '/blocks/head/predecessor', {})
                    .flatMap((headp: any) => {
                      const signed = this.sign(opbytes.operation, keys.sk);
                      const sopbytes = signed.sbytes;
                      const opHash = this.b58cencode(libs.crypto_generichash(32, this.hex2buf(sopbytes)), this.prefix.o);
                      const aop = {
                        pred_block: headp.predecessor,
                        operation_hash: opHash,
                        forged_operation: opbytes.operation,
                        signature: signed.edsig
                      };
                      return this.http.post(this.nodeURL + '/blocks/head/proto/helpers/apply_operation', aop)
                        .flatMap((applied: any) => {
                          const sop = {
                            signedOperationContents: sopbytes,
                            chain_id: head.chain_id
                          };
                          return this.http.post(this.nodeURL + '/inject_operation', sop)
                            .flatMap((final: any) => {
                              return of(
                                {
                                  success: true,
                                  payload: {
                                    opHash: final.injectedOperation,
                                    unsignedOperation: null
                                  }
                                });
                            });
                        });
                    });
                }
              });
          });
      }).pipe(catchError(err => this.errHandler(err)));
  }
  /*
    Returns an observable for the delegation of baking rights.
  */
  delegate(from: string, to: string, fee: number = 0, keys: KeyPair): Observable<any> {
    return this.http.post(this.nodeURL + '/blocks/head', {})
      .flatMap((head: any) => {
        return this.http.post(this.nodeURL + '/blocks/head/proto/context/contracts/' + from + '/counter', {})
          .flatMap((actions: any) => {
            const fop = {
              branch: head.hash,
              kind: 'manager',
              source: from,
              fee: (fee * this.toMicro).toString(),
              counter: ++actions.counter,
              operations: [
                {
                  kind: 'reveal',
                  public_key: keys.pk
                },
                {
                  kind: 'delegation',
                  delegate: to
                }
              ]
            };
            return this.http.post(this.nodeURL + '/blocks/head/proto/helpers/forge/operations', fop)
              .flatMap((opbytes: any) => {
                if (!keys.sk) { // If sk doesn't exist, return unsigned operation
                  return of(
                    {
                      unsignedOperation: opbytes.operation
                    });
                } else { // If sk exists, sign and broadcast operation
                  return this.http.post(this.nodeURL + '/blocks/head/predecessor', {})
                    .flatMap((headp: any) => {
                      const signed = this.sign(opbytes.operation, keys.sk);
                      const sopbytes = signed.sbytes;
                      const opHash = this.b58cencode(libs.crypto_generichash(32, this.hex2buf(sopbytes)), this.prefix.o);
                      const aop = {
                        pred_block: headp.predecessor,
                        operation_hash: opHash,
                        forged_operation: opbytes.operation,
                        signature: signed.edsig
                      };
                      return this.http.post(this.nodeURL + '/blocks/head/proto/helpers/apply_operation', aop)
                        .flatMap((applied: any) => {
                          const sop = {
                            signedOperationContents: sopbytes,
                            chain_id: head.chain_id
                          };
                          return this.http.post(this.nodeURL + '/inject_operation', sop)
                            .flatMap((final: any) => {
                              return of(
                                {
                                  opHash: final.injectedOperation,
                                  unsignedOperation: null
                                });
                            });
                        });
                    });
                }
              });
          });
      }).pipe(catchError(err => this.errHandler(err)));
  }
  errHandler(error: any): Observable<any> {
    console.log('error in errHandler() ', error);
    console.log('HttpErrorResponse in errHandler() ', error.error[0].id);
    if (error.error[0].id) {  // if there's an RPC error id then return user message
      const errorId = error.error[0].id;
      const errorMsg = this.errorHandlingPipe.transform(errorId);
      // console.log('errorMsg in errHandler() ', errorMsg);
      return of(
        {
          success: false,
          payload: {
            msg: errorMsg
          }
        }
      );
    } else {
      return of(
        {
          success: false,
          payload: {
            msg: error
          }
        }
      );
    }
  }
  broadcast(sopbytes: string): Observable<any> {
    return this.http.post(this.nodeURL + '/blocks/head', {})
      .flatMap((head: any) => {
        const sop = {
          signedOperationContents: sopbytes,
          chain_id: head.chain_id
        };
        return this.http.post(this.nodeURL + '/inject_operation', sop)
          .flatMap((final: any) => {
            return of(
              {
                success: true,
                payload: {
                  opHash: final.injectedOperation
                }
              });
          });
      }).pipe(catchError(err => this.errHandler(err)));
  }
  getBalance(pkh: string): Observable<any> {
    return this.http.post(this.nodeURL + '/blocks/head/proto/context/contracts/' + pkh + '/balance', {})
      .flatMap((balance: any) => {
        return of(
          {
            success: true,
            payload: {
              balance: balance.balance
            }
          }
        );
      }).pipe(catchError(err => this.errHandler(err)));
  }
  getDelegate(pkh: string): Observable<any> {
    return this.http.post(this.nodeURL + '/blocks/head/proto/context/contracts/' + pkh + '/delegate', {})
      .flatMap((delegate: any) => {
        let value = '';
        if (delegate.value) {
          value = delegate.value;
        }
        return of(
          {
            success: true,
            payload: {
              delegate: value
            }
          }
        );
      }).pipe(catchError(err => this.errHandler(err)));
  }
  getCounter(pkh: string): Observable<any> {
    return this.http.post(this.nodeURL + '/blocks/head/proto/context/contracts/' + pkh + '/counter', {})
      .flatMap((counter: any) => {
        return of(
          {
            success: true,
            payload: {
              counter: counter.counter
            }
          }
        );
      }).pipe(catchError(err => this.errHandler(err)));
  }
  getAccount(pkh: string): Observable<any> {
    return this.http.get(this.nodeURL + '/chains/main/blocks/head/context/contracts/' + pkh, {})
      .flatMap((contract: any) => {
        let delegate = '';
        if (contract.delegate.value) {
          delegate = contract.delegate.value;
        }
        return of(
          {
            success: true,
            payload: {
              balance: contract.balance,
              manager: contract.manager,
              delegate: delegate,
              counter: contract.counter
            }
          }
        );
      }).pipe(catchError(err => this.errHandler(err)));
  }
  seed2keyPair(seed: string): KeyPair {
    if (!seed) {
      throw new Error('NullSeed');
    }
    const keyPair = libs.crypto_sign_seed_keypair(seed);
    return {
      sk: this.b58cencode(keyPair.privateKey, this.prefix.edsk),
      pk: this.b58cencode(keyPair.publicKey, this.prefix.edpk),
      pkh: this.b58cencode(libs.crypto_generichash(20, keyPair.publicKey), this.prefix.tz1)
    };
  }
  mnemonic2seed(mnemonic: string, passphrase: string = '') {
    if (!this.validMnemonic(mnemonic)) {
      throw new Error('InvalidMnemonic');
    }
    return bip39.mnemonicToSeed(mnemonic, passphrase).slice(0, 32);
  }
  validMnemonic(mnemonic: string) {
    return bip39.validateMnemonic(mnemonic);
  }
  generateMnemonic(): string {
    return bip39.generateMnemonic(160);
  }
  pk2pkh(pk: string): string {
    const pkDecoded = this.b58cdecode(pk, this.prefix.edpk);
    return this.b58cencode(libs.crypto_generichash(20, pkDecoded), this.prefix.tz1);
  }
  hex2buf(hex) {
    return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16);
    }));
  }
  buf2hex(buffer) {
    const byteArray = new Uint8Array(buffer), hexParts = [];
    for (let i = 0; i < byteArray.length; i++) {
      const hex = byteArray[i].toString(16);
      const paddedHex = ('00' + hex).slice(-2);
      hexParts.push(paddedHex);
    }
    return hexParts.join('');
  }
  b58cencode(payload: any, prefixx: Uint8Array) {
    const n = new Uint8Array(prefixx.length + payload.length);
    n.set(prefixx);
    n.set(payload, prefixx.length);
    return Bs58check.encode(new Buffer(this.buf2hex(n), 'hex'));
  }
  b58cdecode(enc, prefixx) {
    let n = Bs58check.decode(enc);
    n = n.slice(prefixx.length);
    return n;
  }
  mergebuf(b) {
    const wm = new Uint8Array([3]);
    const r = new Uint8Array(wm.length + b.length);
    r.set(wm);
    r.set(b, wm.length);
    return r;
  }
  sign(bytes, sk): any {
    const hash = libs.crypto_generichash(32, this.mergebuf(this.hex2buf(bytes)));
    const sig = libs.crypto_sign_detached(hash, this.b58cdecode(sk, this.prefix.edsk), 'uint8array');
    const edsig = this.b58cencode(sig, this.prefix.edsig);
    const sbytes = bytes + this.buf2hex(sig);
    return {
      bytes: bytes,
      sig: sig,
      edsig: edsig,
      sbytes: sbytes,
    };
  }
}
