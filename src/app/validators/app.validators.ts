import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import {Slot} from "../lib/slot";

export class AppValidators {

  public static imageValidator(slotDescription: Slot): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> => {
      return new Promise((res) => {
        const image = new Image();
        image.onload = function () {
          const loadedImage: any = this;
          if (loadedImage.width === slotDescription.width && loadedImage.height === slotDescription.height) {
            res(null);
          } else {
            res({ invalidSize: true });
          }
        };
        image.onerror = function () {
          res({ notFound: true });
        };
        image.src = control.value;
      });
    };
  }

}
