import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BpiService, MemberService } from '../_services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rc-bpi',
  templateUrl: './bpi.component.html'
})

export class BpiComponent implements OnInit {
  formPending: FormGroup;
  formMember: FormGroup;
  formCompany: FormGroup;
  formTerms: FormGroup;
  formStage = 'member';
  bpiData: any;
  totalEmployees: [string];
  roles: [string];
  isSubmitting = false;
  isRegistered = false;
  isPreRegistration = false;
  referrers: [string];

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private bpiService: BpiService,
    private route: ActivatedRoute,
    private memberService: MemberService
  ) {
    // Get select items
    this.roles = this.translate.instant('JOIN.jobRoles');
    this.referrers = this.translate.instant('JOIN.referrers');
    this.totalEmployees = this.translate.instant('BPI.listTotalEmployees');
  }

  ngOnInit(): void {
    if (this.route.snapshot.params.code === 'register') {
      this.isPreRegistration = true;
    }
    this.initForm();
  }

  initForm(): void {
    // user details
    this.formPending = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      job: [''], // as Restaurant
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      gdpr: [false, Validators.requiredTrue],
      status: [''], // as Referrer
      city: [''] // as Referrer
    });
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

  registerInterest(): void {
    this.formPending.controls.job.patchValue(`${this.formPending.controls.job.value}, ${this.formPending.controls.city.value}` );
    this.isRegistered = true;
    console.log(this.formPending.value);
    this.memberService.createPending(this.formPending.value)
      .toPromise()
      .then(res => {
        this.isRegistered = true;
        console.log(`Saved Pending = ${res}`);
      });
  }

  // combine form data and submit
  submit(e): void {
    e.preventDefault();
    this.isSubmitting = true;
    this.bpiData = {
      ...this.formMember.value,
      ...this.formCompany.value,
      bpi_declaration: this.formTerms.valid
    };
    // Make api call
    this.bpiService.createBpiAccount(this.bpiData)
      .subscribe((res) => {
        console.log(res);
        // log user into training platform?
        setTimeout(() => {
          this.isRegistered = true;
          this.formStage = 'complete';
        }, 500);
      });
  }

}
