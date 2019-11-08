import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'rc-join',
  templateUrl: './join.component.html'
})
export class JoinComponent implements OnInit {

  loaded = true;
  referrer = {
    type: 'self',
    code: null,
    name: null,
    restaurant: null
  };
  email = new FormControl('', [Validators.required, Validators.email]);

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

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
    // Call api for referrer details/validation
    // If it's a valid referralCode
    // then fast-track the registration
    // Else go to default registration
    // and generate welcome email
    console.log(`Call API and validate ${this.referrer.code}`);

    // Member
    this.referrer.type = 'member';
    this.referrer.name = 'Brian Turner';

    // Agent
    // this.referrer.type = 'agent';
    // this.referrer.name = 'RSVP';

    // Email
    // this.referrer.type = 'email';
    // this.referrer.name = 'RC';

    this.loaded =true;

  }

  getErrorMessage(){
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        '';
  }

}
