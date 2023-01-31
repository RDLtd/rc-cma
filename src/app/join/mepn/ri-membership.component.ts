import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MemberService} from '../../_services';

@Component({
  selector: 'app-ri-membership',
  templateUrl: './ri-membership.component.html'
})
export class RiMembershipComponent implements OnInit {

  referralCode: string;
  roles: [string];
  referrers: [string];
  formMember: UntypedFormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    private memberService: MemberService
  ) {
    if (this.route.snapshot.params.code) {
      console.log('?', this.route.snapshot.params);
      this.referralCode = this.route.snapshot.params.code;
    }
    // Get select items
    this.roles = this.translate.instant('JOIN.jobRoles');
    this.referrers = this.translate.instant('JOIN.referrers');

    this.initForm();
  }

  ngOnInit(): void {
  }

  initForm(): void {
    this.formMember = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      job: [''], // as Restaurant
      city: ['', Validators.required], // as Referrer
      status: ['', Validators.required],
      gdpr: [false, Validators.requiredTrue]
    });
  }

  /**
   * shortcut reference to form controls
   */
  get f(): object {
    return this.formMember.controls;
  }

  /**
   * Register member and store memberId in session
   * navigate to bpi registration
   */
  submit(): void {}

}
