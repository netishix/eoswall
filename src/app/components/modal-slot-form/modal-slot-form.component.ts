import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Slot, SlotDescription } from '../../types';
@Component({
  selector: 'app-modal-slot-form',
  templateUrl: './modal-slot-form.component.html',
  styleUrls: ['./modal-slot-form.component.scss']
})
export class ModalSlotFormComponent implements OnInit {

  public slotForm: {
    isLoading: boolean,
    isSubmitted: boolean,
    formGroup: FormGroup,
    submit: Function
  } = {
      isLoading: false,
      isSubmitted: false,
      formGroup: this._FormBuilder.group({
        title: [null, Validators.compose([Validators.required, Validators.maxLength(60)])],
        image: [null, Validators.compose([Validators.required, Validators.maxLength(300)])],
        url: [null, Validators.compose([Validators.required, Validators.maxLength(300)])]
      }),
      submit: () => {
        this.slotForm.isSubmitted = true;
        if (this.slotForm.formGroup.valid) {
          this._NgbActiveModal.close(this.slotForm.formGroup.value);
        }
      }
    };
  @Input() slotDescription: SlotDescription;
  @Input() buy: boolean;
  @Input() slot: Slot;

  constructor(public _NgbActiveModal: NgbActiveModal, public _FormBuilder: FormBuilder) { }

  ngOnInit() {
    if (!this.buy) {
      this.slotForm.formGroup.get('title').setValue(this.slot.title);
      this.slotForm.formGroup.get('image').setValue(this.slot.image);
      this.slotForm.formGroup.get('url').setValue(this.slot.url);
    }
  }

}
