import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {BpiService, MemberService} from '../../_services';

@Component({
  selector: 'app-bpi-registration',
  templateUrl: './bpi-registration.component.html'
})
export class BpiRegistrationComponent implements OnInit {

  registered = false;
  registrationStep = 0;
  submitting = false;
  bpiTermsAccepted = false;
  referralCode: string;

  formCompanyDetails: FormGroup;
  formUserDetails: FormGroup;

  totalEmployees: [string];
  roles: [string];
  referrers: [string];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private translate: TranslateService,
    private memberService: MemberService,
    private bpiService: BpiService
  ) {
    /**
     * Check for referral code in url
     */
    if (this.route.snapshot.params.code) {
      this.referralCode = this.route.snapshot.params.code;
    }
    /**
     * String arrays for selection options
     */
    this.roles = this.translate.instant('JOIN.jobRoles');
    this.referrers = this.translate.instant('JOIN.referrers');
    this.totalEmployees = this.translate.instant('BPI.listTotalEmployees');
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    /**
     * User form - equivalent info to RI registration
     */
    this.formUserDetails = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      job: [''], // as Restaurant
      status: ['', Validators.required]
    });
    /**
     * Bpi registration details
     */
    this.formCompanyDetails = this.fb.group({
      companyName: ['', Validators.required],
      companyStreet:  ['', Validators.required],
      companyLocale:  ['', Validators.required],
      companyPostcode:  ['', Validators.required],
      companySiret:  ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      companyEmployees: ['', Validators.required],
      directorFirstName:  ['', Validators.required],
      directorLastName:  ['', Validators.required],
      directorEmail:  ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Form navigation
   */
  get f1(): any {
    return this.formUserDetails.controls;
  }
  get f2(): any {
    return this.formCompanyDetails.controls;
  }
  next(): void {
    this.registrationStep += 1;
  }
  back(): void {
    this.registrationStep -= 1;
  }
  submit(): void {
    this.registrationStep = 3;
  }

  /**
   * user aborts so clear all form data
   */
  abort(): void {
    this.registrationStep = 0;
    this.formUserDetails.reset();
    this.formCompanyDetails.reset();

  }
  /**
   * Retrieve memberId
   */
  startBpiRegistration(): void {
    this.registrationStep = 1;
  }

  /**
   * Bpi terms and GDPR
   *
   */
  acceptBpiTerms(): void {
    this.submitting = false;
    this.registerUser();
  }

  /**
   * Register user
   */
  registerUser(): void {
    this.submitting = true;
    const f = this.f1;
    const ff = this.f2;
    // map the controls
    const bpiData = {
      bpi_forename: f.firstName.value,
      bpi_surname: f.lastName.value,
      bpi_telephone: f.telephone.value,
      bpi_email: f.email.value,
      bpi_role: f.job.value,
      bpi_status: f.status.value,
      bpi_company_name: ff.companyName.value,
      bpi_company_address: ff.companyStreet.value,
      bpi_company_town: ff.companyLocale.value,
      bpi_company_post_code: ff.companyPostcode.value,
      bpi_siret: ff.companySiret.value,
      bpi_company_employees: ff.companyEmployees.value,
      bpi_director_forename: ff.directorFirstName.value,
      bpi_director_surname: ff.directorLastName.value,
      bpi_director_email: ff.directorEmail.value,
      bpi_terms_accepted: true
    };
    // Make api call
    this.bpiService.createBpiAccount(bpiData)
      .subscribe((res) => {
        console.log(res);
        // log user into training platform?
        setTimeout(() => {
          this.submitting = false;
          this.registered = true;
          this.registrationStep = 4;
        }, 500);
      },
        error => alert(error)
      );
  }
}
