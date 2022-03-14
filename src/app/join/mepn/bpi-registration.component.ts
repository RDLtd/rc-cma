import {Component, ElementRef, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {BpiService, MemberService} from '../../_services';
import {ConfirmCancelComponent, LoadService} from '../../common';
import {StorageService} from '../../_services/storage.service';
import {MatDialog} from '@angular/material/dialog';

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
  result: any;
  bpiData: any;

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
    private bpiService: BpiService,
    private loadService: LoadService,
    private storageService: StorageService,
    private el: ElementRef,
    private dialog: MatDialog
  ) {

    // Check for referral code in url
    if (this.route.snapshot.params.code) {
      this.referralCode = this.route.snapshot.params.code;
    }

    // String arrays for selection options
    this.roles = this.translate.instant('JOIN.jobRoles');
    this.referrers = this.translate.instant('JOIN.referrers');
    this.totalEmployees = this.translate.instant('BPI.listTotalEmployees');
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {

    // User form - equivalent info to RI registration
    this.formUserDetails = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      job: [''], // as Restaurant
      status: ['', Validators.required]
    });

    // Bpi registration data
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
   * Shortcut form references
   * and form navigation
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
  // submit(): void {
  //   this.registrationStep = 3;
  // }

  /**
   * This is for users that maybe unsure whether they quality
   */
  contact(): void {
    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        title: 'Not sure?',
        body: 'Would you like one of our Team to contact you and discuss your ?',
        confirm: 'Yes, please contact me',
        cancel: 'No thanks'
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          console.log('Contact me');
          this.emailSupport();
          this.registrationStep = 5;
        }
      },
      error => console.log(error)
    );
  }

  /**
   * If user cancels, warn them that data will be lost
   * before returning them to the opening screen
   * and resetting all forms
   */
  abort(): void {
    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        title: 'Are you sure?',
        body: 'By using this option you will lose any of the information that you have already completed. ' +
          'Are you sure that you want to cancel?',
        confirm: 'Yes, cancel',
        cancel: 'No, go back'
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          this.saveUserToPending();
          this.registrationStep = 0;
          this.formUserDetails.reset();
          this.formCompanyDetails.reset();
        }
      },
      error => console.log(error)
    );
  }

  /**
   * Begin registration process
   * and focus the first form field
   */
  startBpiRegistration(): void {
    this.registrationStep = 1;
    setTimeout(() => {
      const elem = this.el.nativeElement.querySelector('[formcontrolname="firstName"]');
      elem.focus();
    }, 0);
  }

  /**
   * Final submission
   */
  submit(): void {
    this.submitting = false;
    this.registerUser();
  }

  /**
   * Register Bpi user
   */
  registerUser(): void {
    this.loadService.open();
    this.submitting = true;
    const f = this.f1;
    const ff = this.f2;
    // map the controls
    this.bpiData = {
      bpi_first_name: f.firstName.value,
      bpi_last_name: f.lastName.value,
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
      bpi_terms_accepted: true,
      bpi_promo_code: this.referralCode
    };
    // Make api call
    const timeCheck = this.getTimer(20);
    this.bpiService.createBpi(this.bpiData)
      .subscribe((res) => {
        console.log(res);
        clearTimeout(timeCheck);

        this.bpiData.bpi_password = res['bpi_password'];
        this.bpiData.bpi_link = res['bpi_link'];

        this.submitting = false;
        this.registered = true;
        this.registrationStep = 5;
        this.result = res;
        this.loadService.close();

      },
        err => {
          this.loadService.close();
          this.registrationStep = -1;
          this.result = err.error.status;
          console.log(err);
          clearTimeout(timeCheck);
        }
      );
  }

  /**
   * Open a system error timeout alert
   * @param n - number of seconds before triggering alert
   */
  getTimer (n = 30) {
    return setTimeout(() => {
        this.dialog.open(ConfirmCancelComponent, {
          data: {
            title: 'System Error',
            body: 'Unfortunately we cannot register you at this time due to technical issues. Please try again later.',
            confirm: 'OK',
            cancel: 'hide' // don't show
          }
        });
        this.registrationStep = 0;
        this.submitting = false;
        this.loadService.close();
    },
      n * 1000);
  }

  /**
   * Notify support if users request help/advice
   */
  emailSupport(): void {
    const bodyContent =
      `# BPI Enquiry\n\n` +
      `Please contact:\n\n` +
      ` - **Name**: ${ this.f1.firstName.value } ${ this.f1.lastName.value }\n` +
      ` - **Telephone**: ${ this.f1.telephone.value }\n` +
      ` - **Email**: ${ this.f1.email.value }\n` +
      ` - **Company**: ${ this.f2.companyName.value }\n\n` +
      `This is a potential participant that has requested help during the BPI registration process.\n\n` +
      `Thank you`;

    this.memberService.sendEmailRequest(
      'support',
      'support',
      'BPI Enquiry',
      bodyContent)
      .subscribe(() => {
        console.log('Support email sent');
        },
        error => {
          console.log(error);
        }
      );
  }

  /**
   * For users that drop out at point of T&C's
   */
  saveUserToPending(): void {
    const f = this.formUserDetails.value;
    const userData = {
      first_name: f.firstName,
      last_name: f.lastName,
      email: f.email,
      telephone: f.telephone,
      job: f.job,
      bpi_promo_code : this.referralCode
    };
    console.log(userData);
    this.memberService.createPending(userData)
      .toPromise()
      .then((res) => console.log(res));
  }
}
