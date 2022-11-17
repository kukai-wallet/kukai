import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { SubjectService, BuyProvider } from '../../../services/subject/subject.service';

@Component({
  selector: 'app-buy-modal',
  templateUrl: './buy.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class BuyModalComponent extends ModalComponent implements OnInit {
  title = 'Get Tez (XTZ)';
  name = 'buy';
  address = '';
  onrampInstance = null;
  public readonly BuyProviderType = BuyProvider;
  constructor(private subjectService: SubjectService) {
    super();
  }

  ngOnInit() {}
  open() {
    super.open();
  }

  closeModal(): void {
    super.close();
  }
  buyTez(provider: BuyProvider) {
    this.subjectService.buy.next(provider);
    this.closeModal();
  }
}
