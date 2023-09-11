import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberService, AuthenticationService, ErrorService } from '../_services';
import { CmsLocalService } from '../cms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmCancelComponent, LoadService } from '../common';
import { AppConfig } from '../app.config';
import { fadeAnimation } from '../shared/animations';
import { lastValueFrom } from 'rxjs';


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
  selector: 'app-rc-join',
  templateUrl: './join.component.html',
  animations: [fadeAnimation]
})

export class JoinComponent implements OnInit {

  isSubmitting = false;
  isLoaded = false;
  newRegResult: string;
  duplicateField: string;
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
  ssl = window.location.origin.includes('https');

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService,
    private authService: AuthenticationService,
    private cmsLocalService: CmsLocalService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private load: LoadService,
    public config: AppConfig,
    private router: Router,
    private error: ErrorService
  ) {
    // Check url params for a Stripe Session Id (or anything else)
    this.route.queryParams.subscribe(params => {
      this.stripeSessionId = params['session_id'];
      // console.log('stripeSessionId', this.stripeSessionId);
    });
    console.log(`SSL = ${this.ssl}`);
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
    this.pendingMember = JSON.parse(sessionStorage.getItem('app_member_pending')) || {};

  }

  // Check referral
  async setReferral(code) {
    // console.log('CODE', code);
    this.referrer.code = code;
    // Check code
    await this.memberService.getReferral(code)
      .then((promoEvents) => {
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
      .catch(err => {
        console.log(err);
        // the user does not need to see this error!
        this.error.handleError('', 'Unable to get referral code ' + code + '! ' + err);
      });
  }

  // Save pending member details
  savePendingMemberData(data): void {
    if (!!data.first_name) {
      console.log('savePending', data);
      sessionStorage.setItem('app_member_pending', JSON.stringify(data));
      const pendingRecord = lastValueFrom(this.memberService.createPending(data))
        .catch(err => {
          console.log(err);
          // the user does not need to see this error!
          this.error.handleError('', 'Unable to save pending data! ' + err);
        });
      console.log(`Saved Pending = ${pendingRecord}`);
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

    // Check if a referral code was added manually
    // i.e. not via url params and originally set to 'self' referral
    if (sessionStorage.getItem('referrer_type') === 'self' && !!formData.referral_code) {
      // Check code
      // console.log('Add code', formData.referral_code);
      await this.setReferral(formData.referral_code).then(res => console.log(res));
    }

    // Check for duplicates
    await this.memberService.preFlight(formData)
      .then(res => {
        // Not a duplicate
        if (res['status'] === 'OK') {
          // Create free membership?
          if (this.referrer.freeMembership) {
            this.memberService.createFreeMembership(formData)
              .then(() => {
              this.router.navigate(['/signin'], { queryParams: { member: 'new' } })
                .then(() => {
                  this.load.close();
              });
            })
              .catch(err => {
                console.log(err);
                this.error.handleError('failedToCreateFreeMember', 'Unable to create free membership! ' + err);
              });
          } else {
            // If the referral code is added manually then we need
            // to setReferral here
            formData.promo_status = this.referrer.promo_status || null;
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
      })
      .catch(err => {
        console.log(err);
        // the user does not need to see this error!
        this.error.handleError('', 'Unable to execute preflight check! ' + err);
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
          this.error.handleError('', 'Failed to re-read member record! ' + error);
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
          this.error.handleError('', 'Failed to add promo action! ' + error);
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
