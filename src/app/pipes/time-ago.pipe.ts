import { Pipe, PipeTransform } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?
import * as timediff from 'timediff';

@Pipe({
  name: 'timeAgo',
  pure: true  // if false pipe will be called at each changes - necessary for translation - is there a better way?
})
export class TimeAgoPipe implements PipeTransform {
  constructor(
    private translate: TranslateService
  ) { }
  transform(timestamp: number): string {

    const now = this.translate.instant('TIMEAGOPIPE.JUSTNOW');
    const sec = this.translate.instant('TIMEAGOPIPE.SEC');
    const secs = sec;
    const mn = this.translate.instant('TIMEAGOPIPE.MINUTE');
    const mns = mn;
    const hr = this.translate.instant('TIMEAGOPIPE.HOUR');
    const hrs = this.translate.instant('TIMEAGOPIPE.HOURS');
    const day = this.translate.instant('TIMEAGOPIPE.DAY');
    const days = this.translate.instant('TIMEAGOPIPE.DAYS');
    const month = this.translate.instant('TIMEAGOPIPE.MONTH');
    const months = this.translate.instant('TIMEAGOPIPE.MONTHS');
    const year = this.translate.instant('TIMEAGOPIPE.YEAR');
    const years = this.translate.instant('TIMEAGOPIPE.YEARS');

    const timeNow = new Date().getTime();
    const diff = timediff(timestamp, timeNow, 'YMDHmS');

    const keys = Object.keys(diff);
    let count = 0;
    let output = '';

    for (const key of keys) {
      if (diff[key]) {
        if (count) {
          output = output + ' ';
        }
        switch (key) {
          case 'years':
            output = `${diff[key]} ${diff[key] === 1 ? year : years}`;
            break;
          case 'months':
            output = output + `${diff[key]} ${diff[key] === 1 ? month : months}`;
            break;
          case 'days':
            output = output + `${diff[key]} ${diff[key] === 1 ? day : days}`;
            break;
          case 'hours':
            output = output + `${diff[key]} ${diff[key] === 1 ? hr : hrs}`;
            break;
          case 'minutes':
            output = output + `${diff[key]} ${diff[key] === 1 ? mn : mns}`;
            break;
          case 'seconds':
            if (!diff.minutes && diff.seconds < 30) {
              output = now;
            } else if (diff.minutes < 5) {
              output = output + `${diff[key]} ${diff[key] === 1 ? sec : secs}`;
            }
            break;
        }
        if (count) {
          break;
        }
        count++;
      }
    }
    return output;
  }
}

