import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import * as Sentry from '@sentry/angular-ivy';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CONSTANTS, environment } from '../../../environments/environment';
import { SubjectService } from '../subject/subject.service';
import { InputValidationService } from '../input-validation/input-validation.service';

@Injectable({
  providedIn: 'root'
})
export class Interceptor {
  httpErrorReporingActive = false;
  constructor(private walletService: WalletService, private inputValidationService: InputValidationService) {
    if (!!(Math.floor(Math.random() * 10) && environment.production)) {
      return;
    }
    this.httpErrorReporingActive = true;
    Sentry.init({
      environment: environment.production ? 'production' : 'development',
      dsn: 'https://badd344e46aefc1531eee3a6bdc28a9d@o1056238.ingest.sentry.io/4505676358352896',
      maxBreadcrumbs: 0,
      initialScope: {
        tags: {
          network: CONSTANTS.NETWORK
        }
      },
      normalizeDepth: 30,
      beforeSend(ev: any) {
        console.log('ev', JSON.parse(JSON.stringify(ev)));
        if (ev?.tags?.type === 'rpc') {
          const props = ['breadcrumbs', 'exception', 'extra'];
          for (const prop of props) {
            delete ev[prop];
          }
          const title = ev.contexts?.response?.statusText || ev.contexts?.response?.name;
          ev.message = `${title} (${ev.contexts?.response?.status})`;
        } else {
          return null;
        }
        console.log('ev2', ev);
        return ev;
      }
    });
    //this.register();
    console.log('%cInterceptor initialized', 'color: green;');
  }
  reportHttpError(req, errorResponse) {
    try {
      // Only do error reporting on HttpErrorResponse from our primary RPC node for now
      const type = this.getNodeBaseUrl(req?.url) ? 'rpc' : 'unknown';
      if (!this.httpErrorReporingActive || type === 'unknown') {
        return throwError(errorResponse);
      }
      const scope = new Sentry.Scope();
      scope.setTransactionName(this.generalizePath(req.url));
      scope.setTag('type', type);
      scope.setTag('node', this.getNodeBaseUrl(req.url));
      scope.setTag('method', req.method);
      scope.setTag('status.code', `${errorResponse.status}`);
      scope.setTag('status.text', `${errorResponse.statusText}`);
      scope.setTag('pkh.primary', this.walletService?.wallet?.implicitAccounts[0]?.address);
      scope.setUser({ primaryPkh: this.walletService?.wallet?.implicitAccounts[0]?.address });
      const accounts: any = {};
      this.walletService.wallet.getAccounts().forEach(({ address, pk }) => (accounts[address] = pk));
      scope.setContext('accounts', accounts);
      scope.setContext('request', req);
      scope.setContext('response', errorResponse);
      if (req.url) {
        const fingerprints = [this.generalizePath(req.url)];
        fingerprints.push(errorResponse?.status);
        fingerprints.push(errorResponse?.statusText);
        //fingerprints.push(Date.now().toString());
        scope.setFingerprint(fingerprints);
      }
      console.log('scope', scope);
      Sentry.captureException(errorResponse, () => scope);
    } catch (e) {
      console.error(e);
    } finally {
      return throwError(errorResponse);
    }
  }
  /*
    Intercept Rxjs
  */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = performance.now();
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        const rtt = performance.now() - startTime;
        err['RTT'] = Math.round(rtt);
        return this.reportHttpError(req, err);
      })
    );
  }
  /*
    Todo: Intercept fetch
  */
  private generalizePath(url: string): string {
    url = url.replace(this.getNodeBaseUrl(url), '');
    url = url.replace('/chains/main/blocks/', '../');
    url = url
      .split('/')
      .map((p) => {
        return this.inputValidationService.address(p) ? `<${p.slice(0, 2)}_>` : p;
      })
      .join('/');
    return url;
  }
  private getNodeBaseUrl(url: string): string {
    return CONSTANTS.NODE_URL.find((base) => url.startsWith(base)) || '';
  }
}
