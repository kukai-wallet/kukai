import { Injectable } from '@angular/core';
import { OperationService } from '../../services/operation/operation.service';
import { TorusService } from '../../services/torus/torus.service';
import { WalletService } from '../../services/wallet/wallet.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';

enum LookupType { // ordered in priority
  AddressBook,
  TezosDomains,
  Google,
  Reddit,
  Twitter,
  Alias
}

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  public records: { address: string, data: { name: string, lookupType: LookupType }[]}[] = [];
  private pendingLookups: Record<string, boolean> = {};
  constructor(
    private operationService: OperationService,
    private torusService: TorusService,
    private walletService: WalletService,
    private inputValidationService: InputValidationService
  ) {
    this.initCheck();
  }
  initCheck() {
    if (!this.records.length &&
      this.walletService.wallet &&
      this.walletService.wallet.lookups.length) {
        console.log('### Loading lookups from memory');
        this.records = this.walletService.wallet.lookups;
      }
  }
  add(address: string, name: string, lookupType: LookupType) {
    console.log('#name', name);
    const { x, y } = this.index(address, lookupType);
    if (x !== -1) {
      if (y === -1) {
        this.records[x].data.push({ name, lookupType });
      }
    } else {
      this.records.push({ address, data: [{ name, lookupType }]});
    }
    this.walletService.wallet.lookups = this.records;
    this.walletService.storeWallet();
  }
  clear() {
    this.records = [];
    this.pendingLookups = {};
  }
  mark(address: string) {
    const { x, y } = this.indexTop(address);
    if (x === -1) {
      this.records.push({ address, data: []});
    }
    this.walletService.storeWallet();
  }
  async check(address: string) {
    this.initCheck();
    if (address && address.slice(0, 3) === 'tz2') {
      const { x } = this.index(address, 0);
      if (!this.pendingLookups[address] && x === -1) {
        this.pendingLookups[address] = true;
        this.operationService.torusKeyLookup(address).subscribe(async (ans: any) => {
          if (ans) {
          if (
            ans.result &&
            ans.result.Verifiers
          ) {
            const keys = Object.keys(ans.result.Verifiers);
            const verifierMap = this.torusService.verifierMap;
            for (const key of keys) {
              if (key === verifierMap['google'].verifier) {
                this.add(address, ans.result.Verifiers[verifierMap['google'].verifier][0], LookupType.Google);
              } else if (key === verifierMap['reddit'].verifier) {
                this.add(address, ans.result.Verifiers[verifierMap['reddit'].verifier][0], LookupType.Reddit);
              } else if (key === verifierMap['twitter'].verifier) {
                const verifierId = ans.result.Verifiers[verifierMap['twitter'].verifier][0];
                const verifierArray = verifierId.split('|');
                if (verifierArray[0] === 'twitter' && this.inputValidationService.twitterId(verifierArray[1])) {
                  const twitterId = verifierArray[1];
                  const { username } = await this.torusService.twitterLookup(undefined, twitterId);
                  if (username) {
                    this.add(address, '@' + username, LookupType.Twitter);
                  }
                }
              } else {
                console.log('Unhandled verifier result', ans);
              }
            }
            this.pendingLookups[address] = false;
          } else if (!ans.noReveal) {
            this.mark(address);
          }
          // Do nothing if tz2 haven't revealed pk
        }
        });
      }
    }
  }
  torusEntryExist(address: string): boolean {
    const record = this.records[address];
    if (record) {
      for (const entry of record) {
        if (entry.lookupType > 1) {
          return true;
        }
      }
    }
    return false;
  }
  index(address: string, lookupType: LookupType) {
    let [x, y] = Array(2).fill(-1);
    for (let i = 0; i < this.records.length; i++) {
      if (this.records[i].address === address) {
        x = i;
        for (let j = 0; j < this.records[i].data.length; j++) {
          if (this.records[i].data[j].lookupType === lookupType) {
            y = j;
          }
        }
      }
    }
    return { x, y };
  }
  indexTop(address: string) {
    let [x, y] = Array(2).fill(-1);
    for (let i = 0; i < this.records.length; i++) {
      if (this.records[i].address === address) {
        x = i;
        for (let j = 0; j < this.records[i].data.length; j++) {
          if (this.records[i].data[j].lookupType < y || y === -1) {
            y = j;
          }
        }
      }
    }
    return { x, y };
  }
  resolve(party: any): any {
    this.initCheck();
    const { x, y } = this.indexTop(party.address);
    if (x !== -1 && y !== -1) {
      return { name: this.records[x].data[y].name, lookupType: this.records[x].data[y].lookupType, address: party.address };
    } else if (party.alias) {
      return { name: party.alias, lookupType: LookupType.Alias, address: party.address };
    }
    return { address: party.address };
  }
}
