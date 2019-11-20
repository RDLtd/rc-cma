import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService, AuthenticationService } from '../_services';
import { CmsLocalService } from '../cms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'rc-join',
  templateUrl: './join.component.html'
})

export class JoinComponent implements OnInit {

  loaded = false;
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
    private translate: TranslateService
  ) {
    translate.onLangChange.subscribe(lang => {
      this.translate.get('Join').subscribe(data => {this.t_data = data; });
    });
  }

  ngOnInit() {

    // check for referral code
    this.route.paramMap
      .subscribe(params => {
        if (params.has('code')) {
          this.referrer.code = params.get('code');
          this.validateReferral();
        } else {
          this.loaded = true;
        }
      });

    this.company_name = localStorage.getItem('rd_company_name');
    this.company_logo_root = localStorage.getItem('rd_company_logo_root');
    this.company_url = localStorage.getItem('rd_company_url');
    this.translate.get('Join').subscribe(data => {
      this.t_data = data;
    });
    sessionStorage.setItem('referrer_type', 'self');
  }

  validateReferral(): void {
    console.log(`Call API and validate ${this.referrer.code}`);
    this.memberService.getPromo(this.referrer.code).subscribe(
      data => {
        // console.log(data);
        if (data['promos'].length > 0) {
          const ref = data['promos'][0];
          this.referrer.type = 'member';
          this.referrer.name = `${ref.member_first_name} ${ref.member_last_name}`;
          this.referrer.id = ref.member_id;
          sessionStorage.setItem('referrer_type', 'member');
        } else {
          this.referrer.type = 'self';
        }
      },
      error => {
        console.log(error);
        this.referrer.type = 'self';
      });

    // Set referral information

    // Member
    // this.referrer.type = 'member';
    // this.referrer.name = 'Brian Turner';

    // Agent
    // this.referrer.type = 'agent';
    // this.referrer.name = 'RSVP';
    // this referrer.restaurant = 'EN-8001'

    // Email
    // this.referrer.type = 'email';
    // this.referrer.name = 'RC';
    // this referrer.restaurant = 'EN-8001'

        this.loaded = true;
  }

  join(formValue): void {
    // Todo: Signin user
    console.log(formValue);
    // break name into first and last (well, second actually) - assume we get at least something in the name!
    const names = formValue['name'].split(' ');
    if (names.length === 1) {
      // just replicate the first field
      names.push(names[0]);
    }
    const newAdmin = {
      member_first_name: names[0],
      member_last_name: names[1],
      member_email: formValue['email'],
      member_telephone: formValue['mobile'],
      member_job: formValue['role'],
      member_language: localStorage.getItem('rd_country'),
      restaurant_id: 0,
      member_id: 0
    };
    console.log(newAdmin);

    // for now assume no restaurant known, might change for different join modes
    this.memberService.createAdministrator(newAdmin).subscribe(
      data => {
        console.log(JSON.stringify(data));

        // Check for duplicate administrator record
        if (data['status'] === 'Duplicate') {

          this.cmsLocalService.dspSnackbar(this.t_data.AlreadyReg +
            '\n\n(' + data['error'] + ')', 'OK', 10);

        } else {

          this.cmsLocalService.dspSnackbar(this.t_data.Success);

          // record the usage of the code if there was one
          // Note we need the id of the new member here, that is returned by createAdministrator
          if (this.referrer.type === 'member') {
            this.memberService.addPromoAction(this.referrer.code, 'Used', data['member_id']).subscribe(
              action => {
                console.log(JSON.stringify(action));
              },
              error => {
                console.log(JSON.stringify(error));
              });
            // take the member directly to authentication - first need to re-read the member record to get the full object
            this.memberService.getById(data['member_id'])
              .subscribe(
                memberData => {
                  this.authService.setMember(memberData['member'][0]);
                  // no need to check for valid result, using a temporary token for now
                  this.authService.setAuthSession(memberData['member'][0],
                    '$2b$10$B6yh.Y1bLzvUKKeIX3rIyefGybFCwBsQNi3Vhvys/qJfm3lDxR4pu', false);
                },
                error => {
                  // should not really get here, but you never know...
                  console.log('Failed to re-read member record', JSON.stringify(error));
                });
          }

        }
      },
      error => {
        console.log(JSON.stringify(error));
      });
  }

}
