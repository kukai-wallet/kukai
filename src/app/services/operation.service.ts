import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { MessageService } from './message.service';
import { UpdateCoordinatorService } from './update-coordinator.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class OperationService {

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private updateCoordinatorService: UpdateCoordinatorService
  ) { }
  async activate(pkh: string, secret: string) {
    // /blocks/head{}
    console.log('Request head');
    let branch;
    let chain_id;
    this.http.get('http://zeronet-api.tzscan.io/v2/head').subscribe(
      (data: any) => {// console.log(JSON.stringify(data));
        branch = data.hash;
        chain_id = data.chain_id; },
      err => console.log(JSON.stringify(err)),
      () => {
        // /blocks/head/proto/helpers/forge/operations
        console.log('Request forge/operations');
        const op = {
          branch: branch,
          operations: [{
            kind: 'activation',
            pkh: pkh,
            secret: secret}
          ]
        };
        let soc;
        this.http.post('http://zeronet-node.tzscan.io/blocks/head/proto/helpers/forge/operations', op).subscribe(
          (data: any) => {// console.log(JSON.stringify(data))
              soc = data.operation;
            },
          err => console.log(JSON.stringify(err)),
          () => {
            // /inject_operation
            console.log('Request inject_operations');
            const sop = {
              signedOperationContents: soc,
              chain_id: chain_id
            };
            this.http.post('http://zeronet-node.tzscan.io/inject_operation', sop).subscribe(
              data => console.log(JSON.stringify(data)),
              err => console.log(JSON.stringify(err)),
              () => {
                this.updateCoordinatorService.boost();
                this.messageService.addSuccess('Genesis wallet activated! Please wait for balance to update...');
            }
          );
        }
      );
      }
    );
  }
}
