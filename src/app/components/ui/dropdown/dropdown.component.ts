import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ui-dropdown',
  templateUrl: './dropdown.component.html'
})

export class DropdownComponent implements OnInit {
  @Input() list: any[];
  @Input() current: any;
  ecmpId = this.constructor['ɵcmp'].id;
  isOpen = false;
  constructor() { }

  ngOnInit(): void {
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(e) {
    if (e.target.parentNode.id !== this.ecmpId) {
      this.isOpen = false;
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
}