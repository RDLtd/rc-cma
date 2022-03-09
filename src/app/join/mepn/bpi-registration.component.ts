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

  registrationStep = 3;
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
  }
}
