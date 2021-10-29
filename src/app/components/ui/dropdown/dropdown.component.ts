import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ListComponent } from '../generic/list.component';

@Component({
  selector: 'app-ui-dropdown',
  templateUrl: './dropdown.component.html'
})

export class DropdownComponent extends ListComponent implements OnInit {
  @Output() dropdownResponse = new EventEmitter();
  @Input() options: any[];
  selection: any;
  ecmpId = this.constructor['ɵcmp'].id;
  isOpen = false;
  constructor() { super(); }

  ngOnInit(): void {
  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:touchend', ['$event'])
  closeDropdown(e): void {
    if (!e.target.closest('#' + this.ecmpId) && this.isOpen) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }
}