import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService, AuthenticationService, AppService } from '../_services';
import { CmsLocalService } from '../cms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmCancelComponent, LoadService } from '../common';
import { AppConfig } from '../app.config';
import { fadeAnimation } from '../shared/animations';


export interface PendingMember {
  first_name: string;
  last_name: string;
  job: string;
  telephone: string;
  email: string;
  referral_code: string;
  accepts_terms: boolean;
}

@Component({
  selector: 'rc-join',
  templateUrl: './join.component.html',
  animations: [fadeAnimation]
})

export class JoinComponent implements OnInit {

  isSubmitting = false;
  isLoaded = false;
  newRegResult: string;
  duplicateField: string;
  currentApplicant: any;
  pendingMember: PendingMember;
  public brand: any;

  referrer = {
    type: 'self',
    code: null,
    name: null,
    id: 0,
    restaurant: null,
    promo_status: null,
    freeMembership: false
  };
  // validators
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
    public config: AppConfig,
    private appService: AppService,
    private router: Router
  ) {
    // Check url params for a Stripe Session Id (or anything else)
    this.route.queryParams.subscribe(params => {
      this.stripeSessionId = params['session_id'];
      // console.log('stripeSessionId', this.stripeSessionId);
    });
  }

  ngOnInit() {
    // Referral or promo code?
    this.route.paramMap
      .subscribe(params => {
        console.log(params);
        if (params.has('code')) {
          this.setReferral(params.get('code').toUpperCase())
            .then(() => {
              this.isLoaded = true;
              console.log(this.referrer);
            });
        } else {
          sessionStorage.setItem('referrer_type', 'self');
          this.isLoaded = true;
        }

      });

    // Set brand
    this.brand = this.config.brand;

    // Get array of translated jobs
    this.jobs = this.translate.instant('JOIN.jobRoles');

    // Check session storage
    // console.log('Pending Member', this.pendingMember);
    this.pendingMember = JSON.parse(sessionStorage.getItem('rc_member_pending')) || {};

  }

  // Check referral
  async setReferral(code) {
    // Check code
    await this.memberService.getReferral(code)
      .then((promoEvents) => {
        // console.log('promoEvents', promoEvents);
        // To be valid it should have at least 1 event

        if (promoEvents.length) {
          const promo = promoEvents[0];
          this.referrer.code = this.pendingMember.referral_code = code;
          this.referrer.type = 'member';
          this.referrer.name = `${promo.member_first_name} ${promo.member_last_name}`;
          this.referrer.id = promo.member_id;
          this.referrer.promo_status = promo.promo_status;

          this.memberService.checkFreePromo(code).subscribe((res) => {
            console.log('Free?', res);
            this.referrer.freeMembership = res['free'];
          });

        } else {
          this.referrer.type = 'self';
        }
      })
      .catch(err => console.log(err));
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
    // Have they agreed to our terms?
    if (!formData.accepts_terms) {
      this.dialog.open(ConfirmCancelComponent, {
        data: {
          body: this.translate.instant('JOIN.invalidTerms', { brand: this.brand.name }),
          cancel: 'hide',
          confirm: 'OK'
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.load.open();

    // Check for duplicates
    await this.memberService.preFlight(formData)
      .then(res => {

        // Not a duplicate
        if (res['status'] === 'OK') {
          // Create free membership?
          if (this.referrer.freeMembership) {
            this.memberService.createFreeMembership(formData)
              .then((res) => {
              this.router.navigate(['/signin'], { queryParams: { member: 'new' } })
                .then(() => {
                  this.load.close();
              });
            })
              .catch(err => console.log(res));
          } else {
            this.savePendingMemberData(formData);
            this.router.navigate(['/membership-options'])
              .then(() => this.load.close());
          }

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
