import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../../environments/environment';
import { UtilsService } from '../../utils/utils.service';

@Injectable({
  providedIn: 'root'
})
export class ObjktService {
  private queue = [];
  pending = false;
  constructor(private utilsService: UtilsService) {}

  async resolveToken(contractAddress, id) {
    const req = {
      query: `{
        token(where: {fa_contract: {_eq: "${contractAddress}"}, token_id: {_eq: "${id}"}}) {
          highest_offer
          lowest_ask
          metadata
          name
          attributes {
            attribute {
              name,
              value,
              attribute_counts(where: {fa_contract: {_eq: "${contractAddress}"}}) {
                editions
              }
            }
          }
        }
        event(
          where: {token: {fa_contract: {_eq: "${contractAddress}"}, token_id: {_eq: "${id}"}}}
          order_by: {level: asc, timestamp: desc}
          limit: 1
        ) {
          price_xtz
        }
        fa(where: {contract: {_eq: "${contractAddress}"}}) {
          editions
          floor_price
        }
      }`
    };
    try {
      const result = await (
        await fetch(CONSTANTS.OBJKT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req)
        })
      ).json();
      return {
        ...result?.data?.token[0],
        last_sale: result?.data?.event[0]?.price_xtz,
        floor_price: result?.data?.fa[0]?.floor_price,
        editions: result?.data?.fa[0]?.editions
      };
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
  async resolveCollection(address): Promise<any> {
    if (!CONSTANTS.OBJKT_URL) {
      return {};
    }
    while (this.queue.length >= 500) {
      // max 500 results per call
      await this.utilsService.sleep(3000);
    }
    if (!this.pending) {
      this.pending = true;
      this.collect();
    }
    return new Promise((resolve, reject) => {
      this.queue.push({ address, resolve, reject });
    });
  }

  async collect() {
    setTimeout(async () => {
      this.pending = false;
      const queue = this.queue;
      this.queue = [];
      const addresses = queue.map((q) => {
        return q.address;
      });
      const items = await this.resolveCollections(addresses).catch((e) => {
        for (const q of queue) {
          q.reject(e);
          throw e;
        }
      });
      while (queue.length) {
        const promise = queue.shift();
        if (items[promise.address]?.name) {
          promise.resolve(items[promise.address]);
        } else {
          promise.resolve(null);
        }
      }
    }, 3000);
  }

  async resolveCollections(contractAddresses: string[]) {
    if (!CONSTANTS?.OBJKT_URL) {
      return;
    }
    const req = {
      query: `{
        fa(where: {contract: {_in: ${JSON.stringify(contractAddresses)}}}) {
          contract
          name
          logo
        }
      }`
    };
    const _objkts = (
      await (
        await fetch(CONSTANTS.OBJKT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req)
        })
      ).json()
    )?.data?.fa;
    const objkts: any = {};
    if (_objkts) {
      for (const objkt of _objkts) {
        objkts[objkt.contract] = { name: objkt.name, logo: objkt.logo };
      }
    }
    console.log('resolveCollections', objkts);
    return objkts;
  }
}
