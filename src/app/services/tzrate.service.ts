import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class TzrateService {

    private apiUrl = 'https://api.coinmarketcap.com/v1/ticker/tezos/'; // returns a json object, key: price_usd
    XTZrate = 0;
    data: any = {};

    constructor(private http: HttpClient) { }

    getTzrate() {
        this.data = this.http.get(this.apiUrl)
            .subscribe(data => {
                this.XTZrate = data[0]['price_usd'];
            });

        return this.XTZrate;
    }
}
