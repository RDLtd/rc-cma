import { Component, ViewChild, OnInit, Inject, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { CMSService } from '../../_services';
import { CmsLocalService } from '../../cms/cms-local.service';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'rc-profile-verify',
  templateUrl: './profile-verify.component.html'
})

export class ProfileVerifyComponent implements OnInit {

  @ViewChild('profileVerifyForm') profileVerifyForm: NgForm;
  @ViewChild('codeInput') codeInput: ElementRef;
  isSubmitting: boolean = false;

  // translation variables
  t_data: any;

  constructor(
    private cmsService: CMSService,
    public cmsLocalService: CmsLocalService,
    private dialog: MatDialog,
    private translate: TranslateService,
    public profileVerifyDialog: MatDialogRef<ProfileVerifyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  ngOnInit() {
    // send email with verification code to restaurant email
    this.translate.get('Profile-Verify').subscribe(data => this.t_data = data);
    // console.log('Data', this.data);
  }

  onProfileVerifySubmit(f) {

    // console.log(f.profile_verify + ':' + this.data.rest_verification_code);
    if (f.profile_verify === this.data.rest_verification_code) {
      // set OK
      // console.log('onProfileVerifySubmit OK', f.profile_verify.value);
      this.profileVerifyDialog.close({ confirmed: true });
    } else {
      // set failed
      // console.log('onProfileVerifySubmit Failed');
      this.cmsLocalService.dpsSnackbar(this.t_data.Again, 'OK', 10);
      this.codeInput.nativeElement.focus();

    }
  }

  reqVerificationCode(){

    this.cmsService.sendVerificationEmail(this.data.rest_name, this.data.rest_verification_code, this.data.rest_email).subscribe(
      data => {
        // console.log('reqVerificationCode', data);
        // update KS 270918 keep window open
        // this.dialog.closeAll();
        this.cmsLocalService.dpsSnackbar(this.t_data.CodeSent + this.data.rest_email, 'OK', 10);
      },
      error => {
        console.log(error);
      });
  }
}
