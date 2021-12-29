import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/filter';
import { TorusService } from '../../../services/torus/torus.service';
import { MessageService } from '../../../services/message/message.service';
import { ImportService } from '../../../services/import/import.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['../../../../scss/components/views/start/start.component.scss']
})
export class StartComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('canvas') canvas;

  isMobile = false;

  c;
  ctx;
  dots: any[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private walletService: WalletService,
    public translate: TranslateService,
    public torusService: TorusService,
    private importService: ImportService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.subscriptions.add(this.route.queryParams
      .subscribe(async params => {
        if (params?.devtool === 'watch') {
          const address = prompt("Enter watch address");
          if (address) {
            try {
              await this.importService.watch(address);
              this.messageService.startSpinner();
              this.router.navigate([`/account/${address}`]);
            } finally {
              this.messageService.stopSpinner();
            }
          }
        }
      }
      ));
    if (!this.walletService.wallet) {
      this.torusService.initTorus();
    }

    const e = () => {
      this.isMobile = !!parseInt(getComputedStyle(document.documentElement).getPropertyValue('--is-mobile'));
    }
    window.addEventListener('resize', e);
    e();
  }

  async ngAfterViewInit() {
    await this.initCanvas();
    window.requestAnimationFrame(() => this.draw());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async torusLogin(verifier: string): Promise<void> {
    await this.messageService.startSpinner('Loading wallet...');
    // const { keyPair, userInfo } = await this.mockLogin();
    const { keyPair, userInfo } = await this.torusService.loginTorus(verifier).catch(async (e) =>
      await this.messageService.stopSpinner()
    );
    console.log('login done');
    if (keyPair) {
      await this.importService
        .importWalletFromPk(keyPair.pk, '', { verifier: userInfo.typeOfLogin, id: userInfo.verifierId, name: userInfo.name })
        .then((success: boolean) => {
          if (success) {
            console.log('success');
            this.router.navigate([`/account/`]);
            this.messageService.stopSpinner();
          } else {
            this.messageService.addError('Torus import failed');
            this.messageService.stopSpinner();
          }
        });
    } else {
      await this.messageService.stopSpinner();
    }
  }

  private async mockLogin(): Promise<any> {
    const keyPair = {
      sk: 'spsk1VfCfhixtzGvUSKDre6jwyGbXFm6aoeLGnxeVLCouueZmkgtJF',
      pk: 'sppk7cZsZeBApsFgYEdWuSwj92YCWkJxMmBfkN3FeKRmEB7Lk5pmDrT',
      pkh: 'tz2WKg52VqnYXH52TZbSVjT4hcc8YGVKi7Pd'
    };
    const userInfo = {
      typeOfLogin: 'google',
      verifierId: 'mock.user@gmail.com',
      name: 'Mock User'
    };
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ keyPair, userInfo });
      }, 2000);
    });
  }

  async initCanvas() {
    this.c = this.canvas.nativeElement;
    this.recalculateCanvasDimensions();
    this.c.style.pointerEvents = "none";
    this.ctx = this.c.getContext("2d");
    this.dots = [];
    for (let i = 0; i < 1024; ++i) {
      this.dots.push({ dot: [Math.random() * parseFloat(this.c.width), Math.random() * parseFloat(this.c.height), Math.random() * 1 + 1, 0, 2 * Math.PI, true], vx: 0, vy: 1.25 })
    }
  }

  recalculateCanvasDimensions() {
    this.c.width = window.innerWidth;
    this.c.height = window.innerHeight;
  }

  draw() {
    const maxV = 2.5;
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);
    let randvx = (Math.random() * 0.4) - 0.2;
    let randvy = (Math.random() * 0.5) - 0.2;
    for (let i = 0; i < this.dots.length; ++i) {
      if (5 * (this.dots.length / 8) === i) {
        randvx = (Math.random() * 0.4) - 0.2;
        randvy = (Math.random() * 0.5) - 0.25;
      }
      let randvx2 = (Math.random() * 0.1) - 0.05;
      let randvy2 = (Math.random() * 0.1) - 0.05;
      this.ctx.fillStyle = `#fff`;
      this.ctx.beginPath();
      this.dots[i].vx = this.dots[i].vx + randvx + randvx2;
      this.dots[i].vy = this.dots[i].vy + randvy + randvy2;
      const v = Math.sqrt(this.dots[i].vx ** 2 + this.dots[i].vy ** 2);
      if (v > maxV) {
        const factor = maxV / v;
        this.dots[i].vx *= factor;
        this.dots[i].vy *= factor;
      }
      this.dots[i].dot[1] = this.dots[i].dot[1] + this.dots[i].vy;
      this.dots[i].dot[0] = this.dots[i].dot[0] + this.dots[i].vx;
      if (this.dots[i].dot[1] > parseFloat(this.c.height)) {
        this.dots[i].dot[1] = 0;
      } else if (this.dots[i].dot[1] < 0.0) {
        this.dots[i].dot[1] = parseFloat(this.c.height);
      }
      if (this.dots[i].dot[0] > parseFloat(this.c.width)) {
        this.dots[i].dot[0] = 0;
      } else if (this.dots[i].dot[0] < 0.0) {
        this.dots[i].dot[0] = parseFloat(this.c.width);
      }
      this.ctx.arc(...Object.values(this.dots[i].dot));
      this.ctx.closePath();
      this.ctx.fill();
    }
    setTimeout(() => {
      window.requestAnimationFrame(() => this.draw());
    }, 33);
  }
}