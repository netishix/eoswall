import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';

export class AppValidators {

  public static imageValidator(slotDescription): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> => {
      const promise = new Promise((res) => {
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
      return promise;
    };
  }

}
