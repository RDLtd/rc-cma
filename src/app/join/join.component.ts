import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService, AuthenticationService } from '../_services';
import { CmsLocalService } from '../cms';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { LoadService } from '../common/loader/load.service';


@Component({
  selector: 'rc-join',
  templateUrl: './join.component.html'
})

export class JoinComponent implements OnInit {

  isSubmitting = false;
  newRegResult: string;
  duplicateField: string;
  currentApplicant: any;
  referrer = {
    type: 'self',
    code: null,
    name: null,
    id: 0,
    restaurant: null
  };

  t_data: any;

  company_name;
  company_logo_root;
  company_url;

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService,
    private authService: AuthenticationService,
    private cmsLocalService: CmsLocalService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private load: LoadService
  ) {
    translate.onLangChange.subscribe(() => {
      this.translate.get('Join').subscribe(data => {this.t_data = data; });
    });
  }
  ngOnInit() {

    // Referral code in url?
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
    // Set localisation
    this.company_name = localStorage.getItem('rd_company_name');
    this.company_logo_root = localStorage.getItem('rd_company_logo_root');
    this.company_url = localStorage.getItem('rd_company_url');
    this.translate.get('Join').subscribe(data => this.t_data = data);
  }

  async setReferral(code) {
    // Check code
    const ref = await this.memberService.getReferral(code);
    console.log(ref);
    // Valid code
    if (ref) {
      // Set referrer
      this.referrer.code = code;
      this.referrer.type = 'member';
      this.referrer.name = `${ref.member_first_name} ${ref.member_last_name}`;
      this.referrer.id = ref.member_id;
    } else {
      // Invalid code
      this.referrer.type = 'self';
    }
  }

  async submitJoinForm(applicant) {
    this.currentApplicant = applicant;
    this.isSubmitting = true;
    this.load.open(this.t_data.InProgress);

    // Validate code if added manually
    // Wait for response
    if (this.referrer.type !== 'member') {
      await this.setReferral(applicant.code.trim());
    }

    // Create new Content Admin & split full name
    const names = applicant.name.split(' ');
    const admin = {
      member_first_name: names[0],
      member_last_name: names.slice(1).join() || names[0], // combine any additional names
      member_email: applicant.email,
      member_telephone: applicant.mobile,
      member_job: applicant.role,
      member_language: localStorage.getItem('rd_country'),
      restaurant_id: 0,
      member_id: 0
    };

    // Register new admin
    this.createContentAdministrator(admin);
  }

  createContentAdministrator(admin) {

    // console.log(localStorage.getItem('rd_country'), localStorage.getItem('rd_company_prefix'));
    // for now assume no restaurant known, might change for different join modes
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
        this.load.close();
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
