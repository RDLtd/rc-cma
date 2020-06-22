import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
@Directive({
  selector: '[pwdMatch][formControlName],[pwdMatch][formControl],[pwdMatch][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => PwdMatchValidator), multi: true }
  ]
})

export class PwdMatchValidator implements Validator {
  constructor(
    @Attribute('pwdMatch') public pwdMatch: string,
    @Attribute('reverse') public reverse: string) { }

  private get isReverse() {
    if (!this.reverse) return false;
    return this.reverse === 'true';
  }

  validate(c: AbstractControl): { [key: string]: any } {
    // self value
    let v = c.value;

    // control vlaue
    let e = c.root.get(this.pwdMatch);

    // value not equal
    if (e && v !== e.value && !this.isReverse) {
      return {
        pwdMatch: false
      }
    }

    // value equal and reverse
    if (e && v === e.value && this.isReverse) {
      delete e.errors['pwdMatch'];
      if (!Object.keys(e.errors).length) e.setErrors(null);
    }

    // value not equal and reverse
    if (e && v !== e.value && this.isReverse) {
      e.setErrors({ pwdMatch: false });
    }

    return null;
  }
}
