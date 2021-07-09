import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropdownComponent } from '../dropdown.component';

@Component({
  selector: 'app-ui-dropdown-account',
  templateUrl: './account-dropdown.component.html',
  styleUrls: ['../../../../../scss/components/ui/account-dropdown.component.scss']
})
export class AccountDropdownComponent extends DropdownComponent implements OnInit {

  constructor(public router: Router) { super(); }

  ngOnInit(): void {
  }

}