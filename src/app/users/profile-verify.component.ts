import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CMSService, RestaurantService } from '../_services';
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

    if (this.data.contactEmailRequired && f.controls.restaurant_email.dirty) {
      //console.log(this.data.restaurant.restaurant_id, this.data.restaurant.restaurant_email);
      // Update restaurant record first
      this.restaurantService.updateEmail(this.data.restaurant.restaurant_id, this.data.restaurant.restaurant_email)
        .subscribe(result => {
          //console.log(result);
          // then check verification code
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

        });

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
        //console.log(this.codeInput);
        // profile_verify.nativeElement.focus();
        return false;
      }
    } else {
      // no code required
      return true;
    }
  }

  reqVerificationCode(){

    this.cmsService.sendVerificationEmail(
      this.data.restaurant.restaurant_name,
      this.data.restaurant.restaurant_number,
      this.data.restaurant.restaurant_email)
      .subscribe(
      data => {
        // console.log('reqVerificationCode', data);
        // update KS 270918 keep window open
        // this.dialog.closeAll();
        this.cmsLocalService.dspSnackbar(
          this.t_data.CodeSent + this.data.restaurant.restaurant_email,
          'OK',
          10);
      },
      error => {
        console.log(error);
      });
  }
  editEmail() {
    this.editable = true;
    this.originalEmail = this.data.restaurant.restaurant_email
    this.data.contactEmailRequired = true;
    // inject a slight delay so that we can
    // successfully select the email field/content
    setTimeout(() => {
      this.email.nativeElement.select();
    }, 100)

  }
}
