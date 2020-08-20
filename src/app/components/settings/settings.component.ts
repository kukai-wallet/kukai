import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import { BeaconService } from '../../services/beacon/beacon.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  peers = [];
  permissions = [];
  constructor(
    public beaconService: BeaconService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.updateBeaconState();
  }
  registerURIhandler() {
    navigator.registerProtocolHandler('web+tezos', `${window.location.origin}/accounts/%s`, 'Kukai Wallet');
  }
  async removePeers() {
    const peers = await this.beaconService.getPeers();
    await this.beaconService.removePeers();
    this.messageService.add(`Removed ${peers.length} peers`);
    this.updateBeaconState();
  }
  async removePeer(index: number) {
    console.log(index);
    this.updateBeaconState();
  }
  async removePermissions() {
    const permissions = await this.beaconService.getPermissions();
    await this.beaconService.removePermissions();
    this.messageService.add(`Removed ${permissions.length} permissions`);
    this.updateBeaconState();
  }
  async removePermission(index: number) {
    console.log(index);
    this.updateBeaconState();
  }
  async updateBeaconState() {
    this.peers = await this.beaconService.getPeers();
    this.permissions = await this.beaconService.getPermissions();
    console.log(this.peers);
    console.log(this.permissions);
  }
}
