import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CMSService, MemberService, RestaurantService } from '../_services';
import { CmsLocalService } from '../cms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-verification',
  templateUrl: './verification.component.html'
})

export class VerificationComponent implements OnInit {

  @ViewChild('verifyCode') verifyCode: ElementRef;
  @ViewChild('email') email: ElementRef;
  editable = false;
  originalEmail: string;
  codeRequested = false;

  isSubmitting: boolean = false;

  constructor(
    private cmsService: CMSService,
    public cmsLocalService: CmsLocalService,
    public restaurantService: RestaurantService,
    private memberService: MemberService,
    private dialog: MatDialog,
    private translate: TranslateService,
    public profileVerifyDialog: MatDialogRef<VerificationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  ngOnInit() {
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
          this.translate.instant('VERIFY.msgInvalidCode'),
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
    this.codeRequested = true;
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
          this.translate.instant('VERIFY.msgCodeSent', { email: r.restaurant_email }),
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

    // TODO: Can we use the new email service for this stuff now?

    const d = this.data;
    const msg =
      `# EMAIL CHANGE REQUEST\n\n` +
      `The following restaurant has just been associated to a Member and the email address was updated at the same time.\n\n` +
      ` - **MEMBER**: ${localStorage.getItem('rd_username')}(${d.member.member_id})\n` +
      ` - **RESTAURANT**: ${d.restaurant.restaurant_name} (${d.restaurant.restaurant_id})\n` +
      ` - **CURRENT EMAIL**: ${this.originalEmail}\n` +
      ` - **NEW EMAIL**: ${d.restaurant.restaurant_email}\n\n` +
      `## Please review these changes A.S.A.P.`;

    this.memberService.sendEmailRequest( 'curation', 'support', 'Change Review', msg).subscribe(res => console.log(res));
  }
}
