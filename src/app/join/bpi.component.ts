import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-rc-bpi',
  templateUrl: './bpi.component.html'
})
export class BpiComponent implements OnInit {
  formMember: FormGroup;
  formCompany: FormGroup;
  formTerms: FormGroup;
  formStage = 'terms';
  bpiData: any;
  totalEmployees: [string];
  roles: [string];

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    // Get select items
    this.roles = this.translate.instant('JOIN.jobRoles');
    this.totalEmployees = this.translate.instant('BPI.listTotalEmployees');
  }

  ngOnInit(): void {
   this.initForm();
  }

  initForm(): void {
    // user details
    this.formMember = this.fb.group({
      bpi_forename: ['', Validators.required],
      bpi_surname: ['', Validators.required],
      bpi_role: ['', Validators.required],
      bpi_email: ['', [Validators.required, Validators.email]],
    bpi_telephone: ['', Validators.required],
    });
    // company details
    this.formCompany = this.fb.group({
      bpi_company_name: ['', Validators.required],
      bpi_company_address:  ['', Validators.required],
      bpi_company_town:  ['', Validators.required],
      bpi_company_post_code:  ['', Validators.required],
      bpi_siret:  ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      bpi_company_employees: ['', Validators.required],
      bpi_director_forename:  ['', Validators.required],
      bpi_director_surname:  ['', Validators.required],
      bpi_director_email:  ['', [Validators.required, Validators.email]],
    });
    // declarations
    this.formTerms = this.fb.group({
      bpi_company_qualifies: [false, Validators.requiredTrue],
      bpi_data_correct: [false, Validators.requiredTrue],
      bpi_terms_accepted: [false, Validators.requiredTrue]
    });
  }

  // Go to next form stage
  next(form, tgt): void {
    // If the user is owner/manager then prefill the director contact details
    if (tgt === 'company' && this.formMember.controls.bpi_role.value === this.translate.instant('JOIN.jobRoles.0')) {
      this.formCompany.patchValue({
        bpi_director_forename:  this.formMember.controls.bpi_forename.value,
        bpi_director_surname:  this.formMember.controls.bpi_surname.value,
        bpi_director_email:  this.formMember.controls.bpi_email.value
      });
    }
    // Go to next stage
    this.formStage = tgt;
  }

  // Go to previous form stage
  prev(tgt) {
    this.formStage = tgt;
  }

  // combine form data and submit
  submit(): void {
    this.bpiData = {
      ...this.formMember.value,
      ...this.formCompany.value,
      bpi_declaration: this.formTerms.valid
    };
    // Make api call
    console.log(this.bpiData);
  }

}
