import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-rc-bpi',
  templateUrl: './bpi.component.html'
})
export class BpiComponent implements OnInit {
  formMember: FormGroup;
  formCompany: FormGroup;
  formDirector: FormGroup;
  formTerms: FormGroup;
  formStage = 'member';
  formData: any;
  totalEmployees: [string];
  roles: [string];
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    // Get array of translated jobs
    this.roles = this.translate.instant('JOIN.jobRoles');
    this.totalEmployees = this.translate.instant('BPI.listTotalEmployees');
  }

  ngOnInit(): void {
   this.initForm();
  }
  initForm(): void {
    this.formMember = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
    });
    this.formCompany = this.fb.group({
      bpiCompanyName: ['', Validators.required],
      bpiAddressStreet:  ['', Validators.required],
      bpiAddressCity:  ['', Validators.required],
      bpiAddressPostCode:  ['', Validators.required],
      bpiSiret:  ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      bpiEmployees: ['', Validators.required]
    });
    this.formDirector = this.fb.group({
      bpiDirectorFirstName:  ['', Validators.required],
      bpiDirectorLastName:  ['', Validators.required],
      bpiDirectorEmail:  ['', [Validators.required, Validators.email]],
    });
    this.formTerms = this.fb.group({
      bpiDeclaration: [false, Validators.requiredTrue],
      bpiAuthorisation: [false, Validators.requiredTrue],
      bpiTerms: [false, Validators.requiredTrue],
      riTerms: [false, Validators.requiredTrue]
    });
  }

  next(form, tgt): void {
  console.log(this.formMember.controls.role.value === this.translate.instant('JOIN.jobRoles.0'));
    if (tgt === 'director' && this.formMember.controls.role.value === this.translate.instant('JOIN.jobRoles.0')) {
      this.formStage = 'company';
      return;
    }
    this.formStage = tgt;
    console.log(form.value);
  }
  prev(tgt) {
    this.formStage = tgt;
  }
  submit(): void {
    this.formData = {
      ...this.formMember.value,
      ...this.formDirector.value,
      ...this.formCompany.value,
      ...this.formTerms.value
    };
    console.log(this.formData);
  }

}
