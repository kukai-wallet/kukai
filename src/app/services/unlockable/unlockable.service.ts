import { Injectable } from '@angular/core';
import { IndexerService } from '../indexer/indexer.service';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UnlockableService {
  readonly settingsKey = 'settings';
  queue = [];
  workers = 0;
  constructor(public indexerService: IndexerService, private router: Router) {
    this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)).subscribe(async (r: NavigationEnd) => {
      if (r.url.indexOf('/account') === -1) {
        document.documentElement.className = '';
      }
    });
  }

  toggleFeature(type, feat): boolean {
    let unlockables: any = localStorage.getItem(this.settingsKey);
    if (unlockables) {
      try {
        unlockables = JSON.parse(unlockables);
        unlockables[type] = unlockables[type] === feat ? '' : feat;
        localStorage.setItem(this.settingsKey, JSON.stringify(unlockables));
        if (unlockables[type]) {
          document.documentElement.classList.add(feat);
        } else {
          document.documentElement.classList.remove(feat);
        }
        return unlockables[type];
      } catch (e) {
        return false;
      }
    } else {
      unlockables = {};
      unlockables[type] = feat;
      localStorage.setItem(this.settingsKey, JSON.stringify(unlockables));
      document.documentElement.classList.add(feat);
      return true;
    }
  }
  restoreFeatures() {
    let unlockables: any = localStorage.getItem(this.settingsKey);
    if (unlockables) {
      try {
        unlockables = JSON.parse(unlockables);
        for (let feat of Object.keys(unlockables)) {
          if (!!unlockables[feat]) {
            document.documentElement.classList.add(unlockables[feat]);
          }
        }
      } catch (e) {}
    }
  }
}
