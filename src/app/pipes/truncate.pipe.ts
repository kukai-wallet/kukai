import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
    transform(value?: string, args?: number, endTrail?: boolean): string {
        const limit = args ? args : 3;
        const trail = '...';

        let returnString;

        if (endTrail && value.length > limit) {
            const endTrailstring = value.slice(-limit);
            returnString = value.substring(0, limit) + trail + endTrailstring;

            return returnString;
        } else {
            return value.length > limit ? value.substring(0, limit) + trail : value;
        }
    }
}
