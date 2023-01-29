import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { Slot } from '../../lib/slot';
import { AppValidators } from '../../validators/app.validators';
@Component({
  selector: 'app-modal-form-update',
  templateUrl: './modal-form-update.component.html',
  styleUrls: ['./modal-form-update.component.scss']
})
export class ModalFormUpdateComponent implements OnInit {

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
        imageUrl: [null, Validators.compose([Validators.required, Validators.maxLength(300)])],
        url: [null, Validators.compose([Validators.required, Validators.maxLength(300)])],
        owner: [null, Validators.compose([Validators.required])]
      }),
      submit: () => {
        this.slotForm.isSubmitted = true;
        if (this.slotForm.formGroup.valid) {
          this._NgbActiveModal.close(this.slotForm.formGroup.value);
        }
      }
    };
  @Input() slot: Slot;
  @Input() hasScatterInstalled: boolean;

  constructor(public _NgbActiveModal: NgbActiveModal, public _FormBuilder: FormBuilder) { }

  ngOnInit() {
    if (this.slot) {
      this.slotForm.formGroup.get('title')?.setValue(this.slot.title);
      this.slotForm.formGroup.get('imageUrl')?.setValue(this.slot.imageUrl);
      this.slotForm.formGroup.get('url')?.setValue(this.slot.url);
      this.slotForm.formGroup.get('owner')?.setValue(this.slot.owner);
      const validatorFn = AppValidators.imageValidator(this.slot);
      this.slotForm.formGroup.get('imageUrl')?.setAsyncValidators(validatorFn);
    }
  }
}
