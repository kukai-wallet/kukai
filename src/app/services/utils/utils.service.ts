import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor() {}
  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  promiseWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout after ${timeout}ms`));
        }, timeout);
      })
    ]);
  }
}
