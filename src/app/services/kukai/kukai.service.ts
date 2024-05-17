import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { CONSTANTS } from '../../../environments/environment';
import { SubjectService, KUKAI_SERVICE_EXPLORE_KEY, KUKAI_SERVICE_DISCOVER_KEY } from '../subject/subject.service';

export interface ContractAlias {
  name: string;
  contractAddresses: string[];
  description?: string;
  thumbnailImageUrl: string;
  discover?: {
    dappUrl: string;
    category: string[];
    discoverImageUrl: string;
    hasZoomDiscoverImage: string;
  };
}

export interface ExploreData {
  blockList: string[];
  model3DAllowList: string[];
  contractAliases: ContractAlias[];
}

interface ExploreResponse {
  data: {
    environment: {
      mainnet: ExploreData;
      ghostnet: ExploreData;
    };
  };
  signature: string;
}

export interface DiscoverItem {
  title: string;
  categories: string[];
  squareLogoUri: string;
  wideLogoUri: string;
  webBannerUri: string;
  mobileBannerUri: string;
  projectUrl: string;
  description: string;
  backgroundColor?: string;
  zoomDiscoverImg?: boolean;
}

interface Discover {
  data: DiscoverCategory[];
  signature: string;
}
interface DiscoverCategory {
  title: string;
  items: DiscoverItem[];
}

@Injectable({
  providedIn: 'root'
})
export class KukaiService {
  model3dAllowList: string[];
  explore: ExploreResponse = undefined;
  discover: Discover = undefined;
  constructor(public subjectService: SubjectService) {
    try {
      const explore = JSON.parse(localStorage.getItem(KUKAI_SERVICE_EXPLORE_KEY));
      const env = CONSTANTS.MAINNET ? explore.data.environment.mainnet : explore.data.environment.ghostnet;
      env.blockList && env.contractAliases;
      this.explore = explore;
      this.model3dAllowList = env.model3DAllowList;
    } catch (e) {
      console.error(e);
      this.explore = undefined;
      this.model3dAllowList = [];
    }
    try {
      const discover = JSON.parse(localStorage.getItem(KUKAI_SERVICE_DISCOVER_KEY));
      discover.data.length;
      const all = discover.data.find((e) => e?.title === 'All').items;
      all.length;
      this.discover = discover;
    } catch (e) {
      console.error(e);
      this.discover = undefined;
    }
  }
  async fetchExploreData(): Promise<void> {
    try {
      const response = await fetch('https://services.kukai.app/v2/explore', {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const explore: ExploreResponse = await response.json();
      const { data, signature } = explore;
      if (signature !== this.explore?.signature) {
        console.log('Explore change detected');
        this.explore = explore;
        const env = CONSTANTS.MAINNET ? data.environment.mainnet : data.environment.ghostnet;
        this.subjectService.blocklist.next(env.blockList);
        this.subjectService.contractAliases.next(env.contractAliases);
        this.model3dAllowList = env.model3DAllowList;
        localStorage.setItem(KUKAI_SERVICE_EXPLORE_KEY, JSON.stringify(explore));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async fetchDiscoverItems(): Promise<void> {
    let network = CONSTANTS.MAINNET ? '' : 'ghostnet.';
    try {
      const response = await fetch(`https://services.${network}kukai.app/v4/discover?all=true`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const discover: Discover = await response.json();
      const { data, signature } = discover;
      if (signature !== this.discover?.signature) {
        console.log('Discover change detected');
        localStorage.setItem(KUKAI_SERVICE_DISCOVER_KEY, JSON.stringify(discover));
        for (const category of data) {
          if (category.title === 'All') {
            setTimeout(() => {
              this.subjectService.discoverItems.next(category.items);
            }, 0);
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
