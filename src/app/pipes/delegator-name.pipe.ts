import { Pipe, PipeTransform } from '@angular/core';
import { BAKERSLIST } from '../../data/bakers-list';

@Pipe({
    name: 'delegatorName'
})
export class DelegatorNamePipe implements PipeTransform {
    transform(pkh: string): string {
        if (!pkh) {
            return '';
        }
        const index = BAKERSLIST.findIndex(b => b.identity === pkh);
        if (index !== -1) {
            return BAKERSLIST[index].baker_name;
        } else {
            return pkh;
        }
    }
}
