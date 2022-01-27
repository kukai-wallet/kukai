import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TorusService } from '../../../../services/torus/torus.service';
import { DropdownComponent } from '../dropdown.component';

@Component({
  selector: 'app-ui-dropdown-prepare-send',
  templateUrl: './prepare-send-dropdown.component.html',
  styleUrls: ['../../../../../scss/components/ui/dropdown/prepare-send-dropdown.component.scss']
})
export class PrepareSendDropdownComponent extends DropdownComponent implements OnInit {
  @Input() torusVerifierName = 'Tezos Address';
  @Input() torusVerifier = '';

  constructor(public router: Router, public torusService: TorusService) {
    super();
  }

  ngOnInit(): void {}

  toggleDropdown(): void {
    this.dropdownResponse.emit({
      torusVerifierName: this.torusVerifierName,
      torusVerifier: this.torusVerifier
    });
    this.isOpen = !this.isOpen;
  }
}
