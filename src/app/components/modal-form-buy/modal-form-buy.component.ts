import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { Slot } from '../../lib/slot';
import { AppValidators } from '../../validators/app.validators';
@Component({
  selector: 'app-modal-form-buy',
  templateUrl: './modal-form-buy.component.html',
  styleUrls: ['./modal-form-buy.component.scss']
})
export class ModalFormBuyComponent implements OnInit {

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
  @Input() slot: Slot;
  @Input() hasScatterInstalled: boolean;

  constructor(public _NgbActiveModal: NgbActiveModal, public _FormBuilder: FormBuilder) { }

  ngOnInit() {
    const validatorFn = AppValidators.imageValidator(this.slot);
    this.slotForm.formGroup.get('image').setAsyncValidators(validatorFn);
  }
}
