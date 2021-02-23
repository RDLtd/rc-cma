import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService, AuthenticationService, AppService } from '../_services';
import { CmsLocalService } from '../cms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { LoadService } from '../common/loader/load.service';
import { AppConfig } from '../app.config';


@Component({
  selector: 'rc-join',
  templateUrl: './join.component.html'
})

export class JoinComponent implements OnInit {

  isSubmitting = false;
  newRegResult: string;
  duplicateField: string;
  currentApplicant: any;
  pendingMember: any = {
    name: '',
    role: null
  };
  brand: any;
  referrer = {
    type: 'self',
    code: null,
    name: null,
    id: 0,
    restaurant: null,
    promo_status: null
  };
  t_data: any;
  patternMobile = '^([+\\d]\\d*)?\\d$';
  lang = localStorage.getItem('rd_language');
  stripeSessionId: any;

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService,
    private authService: AuthenticationService,
    private cmsLocalService: CmsLocalService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private load: LoadService,
    private config: AppConfig,
    private appService: AppService,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.stripeSessionId = params['session_id'];
      console.log('stripeSessionId', this.stripeSessionId);
    });
    // Switch language
    translate.onLangChange.subscribe(() => {
      this.translate.get('Join').subscribe(data => {
        this.t_data = data;
      });
    });


  }
  ngOnInit() {
    // Check for a referral code in the url
    this.route.paramMap
      .subscribe(params => {
        if (params.has('code')) {
          const ref = this.setReferral(params.get('code'));
          console.log('Url referral', ref);
        } else {
          // No code supplied in url
          sessionStorage.setItem('referrer_type', 'self');
        }
      });
    // Set brand
    this.brand = this.config.brand;
    // Get translations
    this.translate.get('Join').subscribe(data => {
      this.t_data = data;
    });
    // Check session storage
    this.pendingMember = JSON.parse(sessionStorage.getItem('rc_member_pending')) || {};
    console.log('Pending Member', this.pendingMember);

    // Watch for unload event (page refresh etc.)
    // Keep data in session storage
    const that = this;
    window.addEventListener("beforeunload", () => {
      that.savePendingMemberData(that.pendingMember);
    });
  }

  // Display referrer details
  async setReferral(code) {
    // Force referral code to uppercase
    const uCode = code.toUpperCase();
    // Check code
    const ref = await this.memberService.getReferral(uCode);
    //console.log(ref);
    // Valid code
    if (ref) {
      // Set referrer
      this.referrer.code = this.pendingMember.referral_code = uCode;
      this.referrer.type = 'member';
      this.referrer.name = `${ref.member_first_name} ${ref.member_last_name}`;
      this.referrer.id = ref.member_id;
      this.referrer.promo_status = ref.promo_status;
    } else {
      // Invalid code
      this.referrer.type = 'self';
    }
  }

  // Save pending member details
  savePendingMemberData(data): void {
    sessionStorage.setItem('rc_member_pending', JSON.stringify(data));
  }

  // API call to check for duplicate tel/emails
  async preRegistrationCheck(formData) {
    this.isSubmitting = true;
    this.load.open();
    // API call to check for duplicates
    // and anything else?
    this.savePendingMemberData(formData);

    // TODO
    // API pre-flight check
    // If good, proceed
    this.router.navigate(['/membership-options']).then(() => this.load.close())
    // Else, display message to user
    // this.dspRegistrationResult('duplicate', '');
  }

  async submitJoinForm(applicant) {
    this.currentApplicant = applicant;
    this.isSubmitting = true;

    this.load.open();

    // TODO
    // NB Note that for this early December version we set member_type to 'Full'
    // Once there is a paywall we will set this to 'Payment Pending' and update once payment
    // has been received
    const admin = {
      member_first_name: applicant.first_name,
      member_last_name: applicant.last_name,
      member_email: applicant.email,
      member_telephone: applicant.mobile,
      member_job: applicant.role,
      member_language: localStorage.getItem('rd_language'),
      restaurant_id: 0,
      member_id: 0,
      member_promo_status: this.referrer.promo_status,
      member_type: 'Full'
    };

    // Register new admin
    this.createContentAdministrator(admin);
  }

  createContentAdministrator(admin) {

    // for now assume no restaurant known, might change for different join modes

    // test to break it...
    // admin.member_language = 'kkkkkkk';
    this.memberService.createAdministrator(admin).subscribe(
      data => {
        console.log(data);
        // Check for duplicate administrator record
        if (data['status'] === 'Duplicate') {
          this.dspRegistrationResult('duplicate', data['error']);
        } else {
          // Successful registration
          sessionStorage.setItem('referrer_type', this.referrer.type);

          // TODO removed the 'success' snack bar display. Might need to consider showing it in the 'self' path?
          // this.cmsLocalService.dspSnackbar(this.t_data.Success);

          // If the member has been referred
          // update the usage record and fast-track them
          if (this.referrer.type === 'member') {
            this.updateReferralUsage(data['member_id']);
            this.autoSignIn(data['member_id']);
          } else {
            // Registration success
            this.dspRegistrationResult('self-registered');
          }

        }
        this.load.close();
        this.isSubmitting = false;

      },
      error => {
        console.log(JSON.stringify(error));
        this.cmsLocalService.dspSnackbar(
          `${this.t_data.Critical}`,
          'OK',
          20
        );
        // TODO more translations (or do we care since this is only relevant for support...)
        this.appService.reportCriticalError('Failed to register new member!\n\n' +
          'First Name : ' + admin.member_first_name + '\n\n' +
          'Last Name : ' + admin.member_last_name + '\n\n' +
          'Telephone : ' + admin.member_telephone + '\n\n' +
          'Email : ' + admin.member_email).subscribe(emaildata => {
            console.log(emaildata);
            this.load.close();
          },
          emailerror => {
            console.log(emailerror);
            this.load.close();
          });
      });

  }

  autoSignIn(member_id) {
    // take the member directly to authentication - first need to re-read the member record to get the full object
    this.memberService.getById(member_id)
      .subscribe(
        memberData => {
          const newMember = memberData['member'][0];
          this.authService.setMember(newMember);
          // no need to check for valid result, using a temporary token for now
          this.authService.setAuthSession(newMember,
            '$2b$10$B6yh.Y1bLzvUKKeIX3rIyefGybFCwBsQNi3Vhvys/qJfm3lDxR4pu',
            false);
        },
        error => {
          // should not really get here, but you never know...
          console.log('Failed to re-read member record', JSON.stringify(error));
        });
  }

  updateReferralUsage(member_id) {
    // Record usage
    this.memberService.addPromoAction(this.referrer.code, 'Used', member_id)
      .subscribe(
        action => {
          console.log(action);
        },
        error => {
          console.log(error);
        });
  }

  dspRegistrationResult(resultType, errorType = null) {
    this.newRegResult = resultType;
    switch (resultType) {
      case 'duplicate': {
        console.log('Duplicate user:', errorType);
        if (errorType.indexOf('telephone') > 1 && errorType.indexOf('email') > 1) {
          this.duplicateField = 'both';
        } else if (errorType.indexOf('telephone') > 1) {
          this.duplicateField = 'tel';
        } else if (errorType.indexOf('email') > 1) {
          this.duplicateField = 'email';
        }
        break;
      }
      case 'self-registered': {
        this.cmsLocalService.dspSnackbar(
          `${this.t_data.Check}`,
          'OK',
          10
        );
        break;
      }
    }
  }

  curationRequest() {
    this.load.open(this.t_data.Sending);
    // Format as markdown
    const msg = `## ${this.t_data.Help}\n\n` +
      `${this.t_data.Attempt}\n\n` +
      `${this.t_data.ASAP}\n` +
      ` - **${this.t_data.FullName}**: ${this.currentApplicant.name}\n` +
      ` - **${this.t_data.Mobile}**: ${this.currentApplicant.mobile}\n` +
      ` - **${this.t_data.Email}**: ${this.currentApplicant.email}\n` +
      ` - **${this.t_data.Job}**: ${this.currentApplicant.role}\n`;

    this.memberService.sendEmailRequest('curation', 'support', this.t_data.Problem, msg).subscribe(data => {
        console.log(data);
        this.newRegResult = 'support-request-sent';
        this.load.close();
    },
      error => {
        console.log(error);
        this.load.close();
      });
  }
}
