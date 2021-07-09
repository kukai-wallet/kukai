import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ui-dropdown',
  templateUrl: './dropdown.component.html'
})

export class DropdownComponent implements OnInit {
  @Input() list: any[];
  @Input() current: any;
  constructor() { }

  ngOnInit(): void {
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(e) {
    if (!e.target.classList.contains('icon-db')) {
      (document.querySelector('.dropdown-content')?.parentNode as HTMLElement)?.classList.remove('expanded');
    }
  }

  toggleDropdown(sel) {
    document.querySelector(sel).parentNode.classList.toggle('expanded');
  }
}