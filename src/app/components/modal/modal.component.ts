import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ModalPayload {
  name: string | null;
  data: any;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html'
})

export class ModalComponent implements OnInit {

  public isOpen = false;
  name = '';
  static currentModel = new BehaviorSubject<ModalPayload>({ name: '', data: null });

  constructor(@Optional() public cd?: ChangeDetectorRef) {
    this.cd = cd;
    ModalComponent.currentModel.subscribe(load => {
      if (!!load.name && load.name === this.name) {
        if (!this.isOpen) {
          this.willOpen();
          this.open(load.data);
        }
      } else {
        if (this.isOpen) {
          this.close();
          if (this.cd) {
            this.cd.detectChanges();
          }
        }
      }
    })
  }

  ngOnInit(): void {
  }

  willOpen() {

  }

  open(data?: any) {
    if (window.innerHeight < document.body.scrollHeight) {
      document.body.style.marginRight = '0.5rem !important';
      document.body.style.overflowY = 'hidden !important';
    }
    this.isOpen = true;
  }

  close() {
    document.body.style.marginRight = '';
    document.body.style.overflowY = '';
    this.isOpen = false;
  }

}
