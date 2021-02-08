import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CMSService, MemberService, RestaurantService } from '../_services';
import { CmsLocalService } from '../cms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-profile-verify',
  templateUrl: './profile-verify.component.html'
})

export class ProfileVerifyComponent implements OnInit {

  @ViewChild('verifyCode') verifyCode: ElementRef;
  @ViewChild('email') email: ElementRef;
  editable = false;
  originalEmail: string;

  isSubmitting: boolean = false;
  // translation variables
  t_data: any;

  constructor(
    private cmsService: CMSService,
    public cmsLocalService: CmsLocalService,
    public restaurantService: RestaurantService,
    private memberService: MemberService,
    private dialog: MatDialog,
    private translate: TranslateService,
    public profileVerifyDialog: MatDialogRef<ProfileVerifyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  ngOnInit() {
    // send email with verification code to restaurant email
    this.translate.get('Profile-Verify').subscribe(data => this.t_data = data);
    // console.log('Data', this.data);
    this.editable = this.data.contactEmailRequired;
  }

  onProfileVerifySubmit(f) {
    // Email changed
    if (f.controls.restaurant_email.dirty) {
      // If we don't have one
      if (this.data.contactEmailRequired) {
        this.updateRestaurantEmail(false);
        // Then validate the code
        if (this.validateVerificationCode(f.controls.profile_verify)) {
          this.profileVerifyDialog.close(
            {
              emailUpdated: true,
              verified: true
            });
        } else {
          // Invalid code
          this.verifyCode.nativeElement.focus();
        }
      } else {
        // It's being changed so only do it
        // if we have a good verification code
        if (this.validateVerificationCode(f.controls.profile_verify)) {
          this.profileVerifyDialog.close(
            {
              emailUpdated: true,
              verified: true
            });
          this.updateRestaurantEmail(true);
        } else {
          // Invalid code
          this.verifyCode.nativeElement.focus();
        }
      }

    } else {

      if (this.validateVerificationCode(f.controls.profile_verify)) {
        this.profileVerifyDialog.close(
          {
            emailUpdated: false,
            verified: true
          });
      } else {
        // Invalid code
        this.verifyCode.nativeElement.focus();
      }
    }
  }

  updateRestaurantEmail(notify: boolean) {
    // Update restaurant record first
    this.restaurantService.updateEmail(this.data.restaurant.restaurant_id, this.data.restaurant.restaurant_email)
      .subscribe(res => {
          console.log('Email updated', res);
          this.notifyCuration();
        },
        error => {
          console.log(error);
        });
  }

  validateVerificationCode(profile_verify) {
    if (this.data.verificationCodeRequired) {
      if (profile_verify.value === this.data.restaurant.restaurant_number) {
        return true;
      } else {
        // Invalid
        this.cmsLocalService.dspSnackbar(
          this.t_data.Again,
          'OK',
          10);
        // console.log(this.codeInput);
        // profile_verify.nativeElement.focus();
        return false;
      }
    } else {
      // no code required
      return true;
    }
  }

  reqVerificationCode() {
    const userName = localStorage.getItem('rd_username');
    const r = this.data.restaurant;
    console.log(r);
    this.cmsService.sendVerificationEmail(
      r.restaurant_name,
      r.restaurant_number,
      r.restaurant_email,
      userName)
      .subscribe(
      () => {
        this.cmsLocalService.dspSnackbar(
          this.t_data.CodeSent + r.restaurant_email,
          'OK',
          10);
      },
      error => {
        console.log(error);
      });
  }

  editEmail() {
    this.editable = true;
    this.originalEmail = this.data.restaurant.restaurant_email;
    // inject a slight delay so that we can
    // successfully select the email field/content
    setTimeout(() => {
      this.email.nativeElement.select();
    }, 100);

  }

  notifyCuration() {
    const d = this.data;
    const msg =
      `# ${this.t_data.Change}\n\n` +
      `${this.t_data.Just}.\n\n` +
      ` - **${this.t_data.User}**: ${localStorage.getItem('rd_username')}(${d.member.member_id})\n` +
      ` - **Restaurant**: ${d.restaurant.restaurant_name} (${d.restaurant.restaurant_id})\n` +
      ` - **${this.t_data.Oemail}**: ${this.originalEmail}\n` +
      ` - **${this.t_data.Nemail}**: ${d.restaurant.restaurant_email}\n\n` +
      `## ${this.t_data.ASAP}`;

    this.memberService.sendEmailRequest( 'curation', 'support', this.t_data.Change, msg).subscribe(res => console.log(res));
  }
}
