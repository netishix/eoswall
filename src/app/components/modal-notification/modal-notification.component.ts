import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-notification',
  templateUrl: './modal-notification.component.html',
  styleUrls: ['./modal-notification.component.scss']
})
export class ModalNotificationComponent implements OnInit {

  @Input()type?: string;
  @Input()title?: string;
  @Input()description?: string;

  constructor(public _NgbActiveModal: NgbActiveModal) { }

  ngOnInit() {}

}
