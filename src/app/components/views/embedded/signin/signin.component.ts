import { EventEmitter, Input, Output, SimpleChanges, Component, OnInit, OnChanges, AfterViewInit, ElementRef, HostListener } from '@angular/core';
import { LoginConfig } from 'kukai-embed';
import { MessageService } from '../../../../services/message/message.service';
import { TorusService } from '../../../../services/torus/torus.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { UtilsService } from '../../../../services/utils/utils.service';
import { EmbedLoginChoices } from '../../../../libraries/enums';

enum Templates {
  Default = 'default',
  Manutd = 'manutd', // @TODO: replace all magic strings with this value
  Objkt = 'objkt'
}

// Templates an integrator can opt into via loginConfig.template.
// Everything else is assigned from the origin in ngOnInit.
const OPT_IN_TEMPLATES: Set<string> = new Set([Templates.Objkt]);

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnChanges, AfterViewInit {
  constructor(
    private messageService: MessageService,
    public torusService: TorusService,
    private subjectService: SubjectService,
    private elRef: ElementRef,
    private utilsService: UtilsService
  ) {}
  @Input() dismiss: Boolean;
  @Input() loginConfig: LoginConfig;
  @Output() loginResponse = new EventEmitter();
  template = 'default';
  templates = Templates;
  loginOptions = [];
  ngOnInit(): void {
    this.subjectService.origin.subscribe((origin) => {
      if (origin && origin.indexOf('gap') !== -1) {
        this.template = 'gap';
      } else if (origin && origin.indexOf('interpop') !== -1) {
        // (m)interpop
        this.template = 'minterpop';
      } else if (origin && (origin.indexOf('manutd') !== -1 || origin.indexOf('concordia') !== -1)) {
        this.template = 'manutd';
      } else if (origin && origin.indexOf('objkt') !== -1) {
        this.template = Templates.Objkt;
      } else if (OPT_IN_TEMPLATES.has(this.loginConfig?.template)) {
        this.template = this.loginConfig.template;
      } else {
        this.template = 'default';
      }
    });
  }
  ngAfterViewInit(): void {
    this.viewportCheck();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.dismiss?.currentValue === true) {
      this.messageService.stopSpinner().then(() => this.loginResponse.emit('dismiss'));
    }
    if (changes?.loginConfig?.currentValue) {
      if (this.loginConfig.loginOptions?.length > 0) {
        this.loginOptions = [];
        for (const loginOption of this.loginConfig.loginOptions) {
          if (this.torusService.verifierMapKeys.includes(loginOption)) {
            this.loginOptions.push(loginOption);
          }
        }
      } else {
        this.loginOptions = this.torusService.verifierMapKeys;
      }
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.viewportCheck();
  }
  viewportCheck(): void {
    if (screen.width < 650) {
      this.elRef.nativeElement.classList.add('viewport-override-0');
    } else {
      this.elRef.nativeElement.classList.remove('viewport-override-0');
    }
    if (screen.width < 481) {
      this.elRef.nativeElement.classList.add('viewport-override-1');
    } else {
      this.elRef.nativeElement.classList.remove('viewport-override-1');
    }
  }
  async abort() {
    this.elRef.nativeElement.querySelector('.direct-auth-login-alt').style.animation = 'transition-down 0.25s';
    await this.utilsService.sleep(230);
    this.loginResponse.emit(null);
  }
  back() {
    this.loginResponse.emit(undefined);
  }
  async login(typeOfLogin: string) {
    if (typeOfLogin === EmbedLoginChoices.Other) {
      this.loginResponse.emit({ choice: EmbedLoginChoices.Other });
      return;
    }
    try {
      this.messageService.startSpinner('Loading wallet...');
      const loginData = await this.torusService.loginTorus(typeOfLogin);
      if (!loginData?.keyPair) {
        throw new Error('Login failed');
      }
      if (this.dismiss === null) {
        await this.messageService.stopSpinner();
      }
      this.elRef.nativeElement.querySelector('.direct-auth-login-alt').style.animation = 'transition-down 0.25s';
      await this.utilsService.sleep(230);
      this.loginResponse.emit(loginData);
    } catch {
      await this.messageService.stopSpinner();
    }
  }
  getDisplayKey(key: string) {
    return key === 'twitter' ? 'x' : key;
  }
  getImgSrc(key: string) {
    const displayKey = this.getDisplayKey(key);
    const extension = displayKey === 'facebook' || (displayKey === 'x' && this.template === 'manutd') ? '-white.svg' : '-color.svg';
    return '../../../../assets/img/torus-login/' + displayKey + extension;
  }
}
