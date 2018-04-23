import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';
import { KeyPair } from './../interfaces';
import { Buffer } from 'buffer';
import * as libs from 'libsodium-wrappers';
import * as Bs58check from 'bs58check';

@Injectable()
export class OperationService {
  nodeURL = 'http://zeronet-node.tzscan.io';
  prefix = {
    tz1: new Uint8Array([6, 161, 159]),
    edpk: new Uint8Array([13, 15, 37, 217]),
    edsk: new Uint8Array([43, 246, 78, 7]),
    edsig: new Uint8Array([9, 245, 205, 134, 18]),
    o: new Uint8Array([5, 116]),
  };
  toMicro = 1000000;
  constructor(
    private http: HttpClient
  ) { }
  /*
    Returns an observable for the activation of an ICO identity
  */
  activate(pkh: string, secret: string): Observable<any> {
    return this.http.post(this.nodeURL + '/blocks/head', {})
      .flatMap((head: any) => {
        const fop = {
          branch: head.hash,
          operations: [{
            kind: 'activation',
            pkh: pkh,
            secret: secret}
          ]
        };
        return this.http.post(this.nodeURL + '/blocks/head/proto/helpers/forge/operations', fop)
          .flatMap((opbytes: any) => {
            const sop = {
              signedOperationContents: opbytes.operation,
              chain_id: head.chain_id
            };
            return this.http.post(this.nodeURL + '/inject_operation', sop)
            .flatMap((final: any) => {
              return of(
                {
                  opHash: final.injectedOperation
                });
            });
        });
    });
  }
  /*
    Returns an observable for the origination of new accounts.
  */
  originate(keys: KeyPair, pkh: string, amount: number, fee: number): Observable<any> {
    return this.http.post(this.nodeURL + '/blocks/head', {})
      .flatMap((head: any) => {
        return this.http.post(this.nodeURL + '/blocks/head/proto/context/contracts/' + pkh + '/counter', {})
          .flatMap((actions: any) => {
            const fop = {
              branch: head.hash,
              kind: 'manager',
              source: pkh,
              fee: (fee * this.toMicro).toString(),
              counter: ++actions.counter,
              operations: [
                {
                  kind: 'reveal',
                  public_key: keys.pk
                },
                {
                  kind: 'origination',
                  managerPubkey: pkh,
                  balance: (amount * this.toMicro).toString(),
                  spendable: true,
                  delegatable: true
                }
              ]
            };
            console.log(JSON.stringify(fop));
            return this.http.post(this.nodeURL + '/blocks/head/proto/helpers/forge/operations', fop)
              .flatMap((opbytes: any) => {
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
                              newPkh: applied.contracts[0]
                            });
                        });
                    });
                });
            });
        });
    });
  }
  /*
    Returns an observable for the transaction of tezzies.
  */
 transfer(keys: KeyPair, from: string, to: string, amount: number, fee: number): Observable<any> {
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
                            opHash: final.injectedOperation
                          });
                      });
                  });
              });
          });
      });
  });
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
  sign(bytes, sk): any {
    const sig = libs.crypto_sign_detached(this.hex2buf(bytes), this.b58cdecode(sk, this.prefix.edsk), 'uint8array');
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
