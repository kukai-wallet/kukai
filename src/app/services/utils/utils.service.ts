import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor() {}
  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
