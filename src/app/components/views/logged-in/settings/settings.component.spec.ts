import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SettingsComponent } from './settings.component';
import { BeaconService } from '../../../../services/beacon/beacon.service';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { TokenService } from '../../../../services/token/token.service';
import { MessageService } from '../../../../services/message/message.service';
import { CoordinatorService } from '../../../../services/coordinator/coordinator.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { WalletConnectService } from '../../../../services/wallet-connect/wallet-connect.service';

describe('Settings peer removal', () => {
  it('requests removal once when the peer cross is clicked', async () => {
    const removePeer = jasmine.createSpy('removePeer').and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule],
      declarations: [SettingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BeaconService, useValue: { peers: [{ name: 'Test dApp', relayServer: 'relay.example' }], permissions: [], removePeer } },
        { provide: WalletService, useValue: { wallet: null } },
        { provide: TokenService, useValue: {} },
        { provide: MessageService, useValue: {} },
        { provide: CoordinatorService, useValue: {} },
        { provide: SubjectService, useValue: { activeAccount: of(null) } },
        { provide: WalletConnectService, useValue: { pairings: { size: 0 }, sessions: { size: 0 } } }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const cross = element.querySelector<HTMLImageElement>('td img[src$="cross.svg"]');
    if (!cross) {
      throw new Error('Peer remove control not rendered');
    }
    cross.click();
    expect(removePeer).toHaveBeenCalledOnceWith(0);
  });
});
