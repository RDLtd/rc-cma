import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService, AuthenticationService, AppService } from '../_services';
import { CmsLocalService } from '../cms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { LoadService } from '../common';
import { AppConfig } from '../app.config';

export interface PendingMember {
  first_name: string;
  last_name: string;
  job: string;
  telephone: string;
  email: string;
  referral_code: string;
}

@Component({
  selector: 'rc-join',
  templateUrl: './join.component.html'
})

export class JoinComponent implements OnInit {

  isSubmitting = false;
  newRegResult: string;
  duplicateField: string;
  currentApplicant: any;
  pendingMember: PendingMember;
  brand: any;
  referrer = {
    type: 'self',
    code: null,
    name: null,
    id: 0,
    restaurant: null,
    promo_status: null
  };

  patternMobile = '^([+\\d]\\d*)?\\d$';
  lang = localStorage.getItem('rd_language');
  stripeSessionId: any;
  jobs: any;

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
    // Get array of translated jobs
    this.jobs = this.translate.instant('JOIN.jobRoles');

    // Check session storage
    // console.log('Pending Member', this.pendingMember);
    this.pendingMember = JSON.parse(sessionStorage.getItem('rc_member_pending')) || {};

    // Watch for unload event (page refresh etc.)
    // Keep data in session storage
    // const that = this;
    // window.addEventListener("beforeunload", () => {
    //   that.savePendingMemberData(that.pendingMember);
    // });
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
    if (!!data.first_name) {
      console.log('savePending', data);
      sessionStorage.setItem('rc_member_pending', JSON.stringify(data));
      this.memberService.createPending(data)
        .toPromise()
        .then(res => console.log(`Saved Pending = ${res}`));
    }
  }

  // API call to check for duplicate tel/emails
  async preRegistrationCheck(formData) {
    // console.log(formData);
    this.isSubmitting = true;
    this.load.open();
    // API call to check for duplicates
    await this.memberService.preFlight(formData)
      .then(res => {
        console.log('preFlight', res);
        if (res['status'] === 'OK') {
          this.savePendingMemberData(formData);
          this.router.navigate(['/membership-options']).then(() => this.load.close())
        } else {
          console.log('Preflight Res', res);
          this.dspRegistrationResult('duplicate', res['error']);
          this.isSubmitting = false;
          this.load.close();
        }
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
          this.translate.instant('JOIN.msgCheckEmail'),
          'OK',
          10
        );
        break;
      }
    }
  }
}
