import { TestBed } from '@angular/core/testing';
import { WalletClient, P2PPairingRequest } from '@ecadlabs/beacon-sdk';
import { BeaconService } from './beacon.service';
import { MessageService } from '../message/message.service';
import { TzktService } from '../indexer/tzkt/tzkt.service';
import { BcService } from '../bc/bc.service';

describe('BeaconService peer removal', () => {
  let service: BeaconService;
  let client: jasmine.SpyObj<WalletClient>;
  const peer: P2PPairingRequest = {
    id: 'pairing',
    type: 'p2p-pairing-request',
    name: 'Test dApp',
    version: '2',
    publicKey: '00'.repeat(32),
    relayServer: 'relay.example'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MessageService, useValue: {} },
        { provide: TzktService, useValue: {} },
        { provide: BcService, useValue: {} }
      ]
    });
    service = TestBed.inject(BeaconService);
    client = jasmine.createSpyObj<WalletClient>('WalletClient', ['removePeer', 'removeAppMetadata', 'getPeers', 'getPermissions']);
    client.removePeer.and.resolveTo();
    client.removeAppMetadata.and.resolveTo();
    client.getPeers.and.resolveTo([]);
    client.getPermissions.and.resolveTo([]);
    service.client = client;
    service.peers = [peer];
  });

  it('notifies the dApp when removing a peer', async () => {
    await service.removePeer(0);
    expect(client.removePeer).toHaveBeenCalledOnceWith(jasmine.objectContaining({ publicKey: peer.publicKey }), true);
  });

  it('waits for the peer list refresh before resolving removal', async () => {
    let releasePeers: (peers: []) => void = () => {
      throw new Error('Refresh not started');
    };
    client.getPeers.and.returnValue(
      new Promise((resolve) => {
        releasePeers = resolve;
      })
    );
    let completed = false;
    const removal = service.removePeer(0).then(() => {
      completed = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(client.getPeers).toHaveBeenCalled();
    expect(completed).toBeFalse();
    releasePeers([]);
    await removal;
    expect(service.peers).toEqual([]);
  });

  it('does not clear metadata when SDK removal fails', async () => {
    client.removePeer.and.rejectWith(new Error('Removal failed'));
    await expectAsync(service.removePeer(0)).toBeRejectedWithError('Removal failed');
    expect(client.removeAppMetadata).not.toHaveBeenCalled();
  });
});
