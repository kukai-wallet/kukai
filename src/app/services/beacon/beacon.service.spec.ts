import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { ExtendedP2PPairingResponse, getSenderId, WalletClient } from '@ecadlabs/beacon-sdk';
import { BeaconService } from './beacon.service';
import { MessageService } from '../message/message.service';
import { TzktService } from '../indexer/tzkt/tzkt.service';
import { BcService } from '../bc/bc.service';

describe('BeaconService peer removal', () => {
  let service: BeaconService;
  let client: jasmine.SpyObj<WalletClient>;
  let storedPeers: ExtendedP2PPairingResponse[];
  let first: ExtendedP2PPairingResponse;
  let second: ExtendedP2PPairingResponse;

  beforeEach(async () => {
    const publicKey = '00'.repeat(32);
    first = {
      id: 'first',
      type: 'p2p-pairing-response',
      name: 'First dApp',
      version: '3',
      publicKey,
      relayServer: 'relay.example',
      senderId: await getSenderId(publicKey)
    };
    second = { ...first, id: 'second', name: 'Second dApp', publicKey: '11'.repeat(32), senderId: await getSenderId('11'.repeat(32)) };
    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: {} },
        { provide: TzktService, useValue: {} },
        { provide: BcService, useValue: {} }
      ]
    });
    service = TestBed.inject(BeaconService);
    client = jasmine.createSpyObj<WalletClient>('WalletClient', ['removePeer', 'removeAppMetadata', 'getPeers', 'getPermissions']);
    storedPeers = [first];
    client.removePeer.and.callFake(async (peer) => {
      storedPeers = storedPeers.filter((p) => p.publicKey !== peer.publicKey);
    });
    client.removeAppMetadata.and.resolveTo();
    client.getPeers.and.callFake(async () => [...storedPeers]);
    client.getPermissions.and.resolveTo([]);
    service.client = client;
    service.peers = [...storedPeers];
  });

  it('requests disconnect and removes metadata for the selected peer', async () => {
    await service.removePeer(0);
    expect(client.removePeer).toHaveBeenCalledOnceWith(first, true);
    expect(client.removeAppMetadata).toHaveBeenCalledOnceWith(first.senderId);
    expect(service.peers).toEqual([]);
    expect(service.permissions).toEqual([]);
  });

  it('preserves a replacement pairing in storage when the displayed peers are stale', async () => {
    const replacement = { ...first, id: 'replacement' };
    storedPeers = [replacement];
    await service.removePeer(0);
    expect(client.removePeer).not.toHaveBeenCalled();
    expect(client.removeAppMetadata).not.toHaveBeenCalled();
    expect(storedPeers).toEqual([replacement]);
    expect(service.peers).toEqual([replacement]);
    expect(client.getPermissions).toHaveBeenCalled();
  });

  it('refreshes a stale row without disconnecting a peer already removed from storage', async () => {
    storedPeers = [];
    await service.removePeer(0);
    expect(client.removePeer).not.toHaveBeenCalled();
    expect(client.removeAppMetadata).not.toHaveBeenCalled();
    expect(service.peers).toEqual([]);
    expect(client.getPermissions).toHaveBeenCalled();
  });

  it('waits for the peer refresh before completing', fakeAsync(() => {
    let release: (peers: ExtendedP2PPairingResponse[]) => void;
    const refreshedPeers = new Promise<ExtendedP2PPairingResponse[]>((resolve) => {
      release = resolve;
    });
    client.removePeer.and.callFake(async () => {
      storedPeers = [];
      client.getPeers.and.returnValue(refreshedPeers);
    });
    let completed = false;
    service.removePeer(0).then(() => {
      completed = true;
    });
    flushMicrotasks();
    expect(client.getPeers).toHaveBeenCalled();
    expect(completed).toBeFalse();
    release([]);
    flushMicrotasks();
    expect(completed).toBeTrue();
    expect(service.peers).toEqual([]);
  }));

  it('waits for the permission refresh before completing', fakeAsync(() => {
    let release: (permissions: []) => void;
    client.getPermissions.and.returnValue(
      new Promise((resolve) => {
        release = resolve;
      })
    );
    let completed = false;
    service.removePeer(0).then(() => {
      completed = true;
    });
    flushMicrotasks();
    expect(client.getPermissions).toHaveBeenCalled();
    expect(completed).toBeFalse();
    release([]);
    flushMicrotasks();
    expect(completed).toBeTrue();
  }));

  it('clears metadata and refreshes state when notification fails after local removal', async () => {
    client.removePeer.and.callFake(async () => {
      storedPeers = [];
      throw new Error('Relay failed');
    });
    await expectAsync(service.removePeer(0)).toBeRejectedWithError('Relay failed');
    expect(client.removeAppMetadata).toHaveBeenCalledOnceWith(first.senderId);
    expect(service.peers).toEqual([]);
    expect(client.getPermissions).toHaveBeenCalled();
  });

  it('retains metadata and refreshes state when removal fails with the peer still present', async () => {
    client.removePeer.and.rejectWith(new Error('Storage failed'));
    await expectAsync(service.removePeer(0)).toBeRejectedWithError('Storage failed');
    expect(client.removeAppMetadata).not.toHaveBeenCalled();
    expect(service.peers).toEqual([first]);
    expect(client.getPeers).toHaveBeenCalled();
    expect(client.getPermissions).toHaveBeenCalled();
  });

  it('refreshes state even when metadata cleanup fails', async () => {
    client.removeAppMetadata.and.rejectWith(new Error('Metadata failed'));
    await expectAsync(service.removePeer(0)).toBeRejectedWithError('Metadata failed');
    expect(service.peers).toEqual([]);
    expect(client.getPermissions).toHaveBeenCalled();
  });

  it('coalesces overlapping removal of the same peer', fakeAsync(() => {
    let release: () => void;
    client.removePeer.and.callFake(
      () =>
        new Promise<void>((resolve) => {
          release = () => {
            storedPeers = [];
            resolve();
          };
        })
    );
    let completed = 0;
    service.removePeer(0).then(() => completed++);
    service.removePeer(0).then(() => completed++);
    flushMicrotasks();
    expect(client.removePeer).toHaveBeenCalledTimes(1);
    release();
    flushMicrotasks();
    expect(completed).toBe(2);
    expect(client.removeAppMetadata).toHaveBeenCalledTimes(1);
  }));

  it('allows retry after failure', async () => {
    client.removePeer.and.rejectWith(new Error('Temporary failure'));
    await expectAsync(service.removePeer(0)).toBeRejectedWithError('Temporary failure');
    client.removePeer.and.callFake(async () => {
      storedPeers = [];
    });
    await service.removePeer(0);
    expect(client.removePeer).toHaveBeenCalledTimes(2);
    expect(service.peers).toEqual([]);
  });

  it('ignores an index no longer present', async () => {
    await service.removePeer(-1);
    expect(client.removePeer).not.toHaveBeenCalled();
  });

  it('removes each original peer once and leaves newly paired peers alone', async () => {
    storedPeers = [first, second];
    service.peers = [...storedPeers];
    const added = { ...first, id: 'added', publicKey: '22'.repeat(32), senderId: await getSenderId('22'.repeat(32)) };
    client.removePeer.and.callFake(async (peer) => {
      storedPeers = storedPeers.filter((p) => p.publicKey !== peer.publicKey);
      if (peer.publicKey === first.publicKey) storedPeers.push(added);
      if (client.removePeer.calls.count() > 2) throw new Error('Removed beyond original snapshot');
    });
    await service.removePeers();
    expect(client.removePeer.calls.allArgs()).toEqual([
      [first, true],
      [second, true]
    ]);
    expect(service.peers).toEqual([added]);
  });

  it('does not loop when refresh still contains a peer', async () => {
    client.removePeer.and.callFake(async () => {
      if (client.removePeer.calls.count() > 1) throw new Error('Repeated removal');
    });
    await service.removePeers();
    expect(client.removePeer).toHaveBeenCalledTimes(1);
    expect(client.removeAppMetadata).not.toHaveBeenCalled();
  });

  it('does not repeat a single removal that overlaps Remove all', fakeAsync(() => {
    storedPeers = [first, second];
    service.peers = [...storedPeers];
    let release: () => void;
    client.removePeer.and.callFake((peer) => {
      if (client.removePeer.calls.count() === 1) {
        return new Promise<void>((resolve) => {
          release = () => {
            storedPeers = [first];
            resolve();
          };
        });
      }
      storedPeers = storedPeers.filter((p) => p.publicKey !== peer.publicKey);
      return Promise.resolve();
    });
    let completed = 0;
    service.removePeer(1).then(() => completed++);
    service.removePeers().then(() => completed++);
    flushMicrotasks();
    release();
    flushMicrotasks();
    expect(completed).toBe(2);
    expect(client.removePeer.calls.allArgs()).toEqual([
      [second, true],
      [first, true]
    ]);
  }));

  it('does not remove a new pairing that replaces a queued peer with the same public key', fakeAsync(() => {
    storedPeers = [first, second];
    service.peers = [...storedPeers];
    const replacement = { ...second, id: 'new-pairing' };
    let release: () => void;
    client.removePeer.and.callFake(
      () =>
        new Promise<void>((resolve) => {
          if (client.removePeer.calls.count() > 1) {
            resolve();
            return;
          }
          release = () => {
            storedPeers = [replacement];
            resolve();
          };
        })
    );
    let completed = 0;
    service.removePeer(0).then(() => completed++);
    service.removePeer(1).then(() => completed++);
    flushMicrotasks();
    release();
    flushMicrotasks();
    expect(completed).toBe(2);
    expect(client.removePeer).toHaveBeenCalledOnceWith(first, true);
    expect(service.peers).toEqual([replacement]);
  }));

  it('stops Remove all on the first failure and reconciles the removed peer', async () => {
    storedPeers = [first, second];
    service.peers = [...storedPeers];
    client.removePeer.and.callFake(async () => {
      storedPeers = [second];
      throw new Error('Relay failed');
    });
    await expectAsync(service.removePeers()).toBeRejectedWithError('Relay failed');
    expect(client.removePeer).toHaveBeenCalledTimes(1);
    expect(client.removeAppMetadata).toHaveBeenCalledOnceWith(first.senderId);
    expect(service.peers).toEqual([second]);
  });
});
