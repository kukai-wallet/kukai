import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  let fixture: ComponentFixture<SettingsComponent>;
  let removePeer: jasmine.Spy;
  let removePeers: jasmine.Spy;
  let addError: jasmine.Spy;
  const first = { id: 'first', name: 'First dApp', relayServer: 'relay.example', publicKey: '00'.repeat(32) };
  const second = { ...first, id: 'second', name: 'Second dApp', publicKey: '11'.repeat(32) };
  let beacon: { peers: (typeof first)[]; permissions: []; removePeer: jasmine.Spy; removePeers: jasmine.Spy };

  beforeEach(async () => {
    removePeer = jasmine.createSpy('removePeer').and.resolveTo();
    removePeers = jasmine.createSpy('removePeers').and.resolveTo();
    addError = jasmine.createSpy('addError');
    beacon = { peers: [first, second], permissions: [], removePeer, removePeers };
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule],
      declarations: [SettingsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BeaconService, useValue: beacon },
        { provide: WalletService, useValue: { wallet: null } },
        { provide: TokenService, useValue: {} },
        { provide: MessageService, useValue: { addError } },
        { provide: CoordinatorService, useValue: {} },
        { provide: SubjectService, useValue: { activeAccount: of(null) } },
        { provide: WalletConnectService, useValue: { pairings: { size: 0 }, sessions: { size: 0 } } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
  });

  function cross(index = 0): HTMLImageElement {
    const element: HTMLElement = fixture.nativeElement;
    const result = element.querySelectorAll<HTMLImageElement>('td img[src$="cross.svg"]')[index];
    if (!result) throw new Error('Peer remove control not rendered');
    return result;
  }

  it('requests removal once when the peer cross is clicked', () => {
    cross().click();
    expect(removePeer).toHaveBeenCalledOnceWith(0);
  });

  it('keeps the containing cell clickable', () => {
    cross().parentElement.click();
    expect(removePeer).toHaveBeenCalledOnceWith(0);
  });

  it('identifies the clicked peer if the service list changed before rendering', () => {
    beacon.peers = [second, first];
    cross().click();
    expect(removePeer).toHaveBeenCalledOnceWith(1);
  });

  it('ignores a rendered peer that has already been removed', () => {
    beacon.peers = [second];
    cross().click();
    expect(removePeer).not.toHaveBeenCalled();
  });

  it('does not remove a new pairing through its old rendered row', () => {
    beacon.peers = [{ ...first, id: 'new-pairing' }, second];
    cross().click();
    expect(removePeer).not.toHaveBeenCalled();
  });

  it('reports a single-removal failure to the user', async () => {
    removePeer.and.rejectWith(new Error('Relay failed'));
    cross().click();
    await fixture.whenStable();
    expect(addError).toHaveBeenCalledTimes(1);
    expect(addError.calls.mostRecent().args[0]).toContain('remove');
  });

  it('reports a Remove all failure to the user', async () => {
    removePeers.and.rejectWith(new Error('Relay failed'));
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLElement>('th span').click();
    await fixture.whenStable();
    expect(removePeers).toHaveBeenCalledTimes(1);
    expect(addError).toHaveBeenCalledTimes(1);
  });
});
