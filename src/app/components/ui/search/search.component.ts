import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { WalletService } from '../../../services/wallet/wallet.service';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search.component.html',
  styleUrls: ['../../../../scss/components/ui/search-bar/search.component.scss']
})
export class SearchBarComponent extends DropdownComponent implements OnInit, OnDestroy {

  @ViewChild('input') input: ElementRef;
  @Output() onInput = new EventEmitter();
  @Input() itemCount = 0;
  @Input() matchCount = 0;
  inputUpdated = new Subject<any>();
  filter = ".*";
  isActive = false;
  hasValue = false;
  @Input() placeholder = '';
  placeholderText = '';
  searchText = ''
  private subscriptions: Subscription = new Subscription();

  constructor(private walletService: WalletService) {
    super();
    this.subscriptions.add(this.inputUpdated.pipe(debounceTime(150)).subscribe((e) => {
      this.filter = !!e?.target.value ? `${e.target.value.replace(/(\W)/g, '\\$1')}` : "";
      if (!!e) { this.onInput.emit(this.filter); };
      this.hasValue = !!this.filter;
    }));
    this.subscriptions.add(this.walletService.activeAccount.subscribe(_ => {
      this.reset();
    }));
  }
  ngOnInit(): void {
    this.placeholderText = this.placeholder;
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onKeydown(e): void {
    this.inputUpdated.next(e);
  }
  onFocus(): void {
    this.isActive = true;
    this.onInput.emit(this.filter);
  }
  searchButtonClicked(): void {
    if (!this.isActive) {
      this.input.nativeElement.focus();
    }
  }
  @HostListener('document:click', ['$event'])
  @HostListener('document:touchend', ['$event'])
  onBlur(e): void {
    if (!e.target.closest('#' + this.ecmpId) && this.isActive && !this.hasValue) {
      this.isActive = false;
      this.onInput.emit("");
    }
  }
  reset(): void {
    this.isActive = false;
    this.filter = '';
    this.searchText = '';
    this.hasValue = false;
    this.onInput.emit(this.filter);
  }
}