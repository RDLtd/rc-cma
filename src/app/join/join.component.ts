import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '../_services';

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
    restaurant: null
  };

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService
  ) { }

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
  }

  validateReferral():void {

    // Todo: invoke api call to check referral code and, if valid, return all relevant information
    console.log(`Call API and validate ${this.referrer.code}`);

    // Set referral information

    // Member
    this.referrer.type = 'member';
    this.referrer.name = 'Brian Turner';

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

  join(formValue):void {
    // Todo: Create user (member/administrator?)
    // Todo: Associate restaurant (if applicable)
    // Todo: Signin user
    console.log(formValue);
  }

}
