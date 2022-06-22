import { Injectable } from '@angular/core';
import { IndexerService } from '../indexer/indexer.service';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UnlockableService {
  readonly settingsKey = 'settings';
  unlockables: any;
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
    this.unlockables = localStorage.getItem(this.settingsKey);
    if (this.unlockables) {
      try {
        this.unlockables = JSON.parse(this.unlockables);
        this.unlockables[type] = this.unlockables[type] === feat ? '' : feat;
        localStorage.setItem(this.settingsKey, JSON.stringify(this.unlockables));
        if (this.unlockables[type]) {
          document.documentElement.classList.add(feat);
        } else {
          document.documentElement.classList.remove(feat);
        }
        return this.unlockables[type];
      } catch (e) {
        return false;
      }
    } else {
      this.unlockables = {};
      this.unlockables[type] = feat;
      localStorage.setItem(this.settingsKey, JSON.stringify(this.unlockables));
      document.documentElement.classList.add(feat);
      return true;
    }
  }
  restoreFeatures() {
    this.unlockables = localStorage.getItem(this.settingsKey);
    if (this.unlockables) {
      try {
        this.unlockables = JSON.parse(this.unlockables);
        for (let feat of Object.keys(this.unlockables)) {
          if (!!this.unlockables[feat]) {
            document.documentElement.classList.add(this.unlockables[feat]);
          }
        }
      } catch (e) {}
    }
  }
}
