import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MemberService } from '../_services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-rc-password',
  templateUrl: './password.component.html'
})

export class PasswordComponent implements OnInit {

  @ViewChild('pwdUpdateForm', {static: true}) loginForm: NgForm;
  isSubmitting = false;
  member: any;
  dialog: any;
  hidePwd = true;

  constructor(
    private translate: TranslateService,
    private memberService: MemberService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }

  dspSnackbarMsg(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  onPwdSubmit(formData) {

    this.isSubmitting = true;

    // Check current pwd
    this.memberService.login(this.member.member_email, formData.old_pwd)
      .subscribe({
          next: () => {
              this.memberService.password(this.member.member_id, formData.new_pwd)
                  .subscribe({
                      next: () => {
                          this.dspSnackbarMsg(this.translate.instant('SETTINGS.password.successUpdated'), null);
                          this.isSubmitting = false;
                          this.dialog.close();
                      },
                      error: error => {
                          console.log(error);
                          // console.log('Failed to update password for settings ' + this.member.member_id);
                          this.dspSnackbarMsg(this.translate.instant('SETTINGS.password.errorFailed'), null);
                          this.isSubmitting = false;
                      }
                  });
          },
          error: error => {
              console.log(error);
              // console.log('Member ' + this.member.member_id + ' failed authorisation');
              this.dspSnackbarMsg(this.translate.instant('SETTINGS.password.errorInvalid'), 'OK');
              this.isSubmitting = false;
          }
      });
  }
}
