import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MemberService } from '../_services';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-password',
  templateUrl: './password.component.html'
})
export class PasswordComponent implements OnInit {

  @ViewChild('pwdUpdateForm', {static: true}) loginForm: NgForm;
  isSubmitting: boolean = false;
  member: any;
  dialog: any;

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

  onPwdSubmit(f) {
    console.log(f);
    this.isSubmitting = true;

    // Check current pwd
    this.memberService.login(this.member.member_email, f.old_pwd).subscribe(
      data => {
        console.log(data);

        this.memberService.password(this.member.member_id, f.new_pwd).subscribe(
          data => {
            // console.log(data);
            // console.log('Password for member ' + this.member.member_id + ' updated');
            let t1;
            this.translate.get('Password.Updated').subscribe(value => t1 = value);
            this.dspSnackbarMsg(t1, null);
            this.isSubmitting = false;
            this.dialog.close();

          },
          error => {
            console.log(error);
            // console.log('Failed to update password for member ' + this.member.member_id);
            let t1;
            this.translate.get('Password.Failed').subscribe(value => t1 = value);
            this.dspSnackbarMsg(t1, null);
            this.isSubmitting = false;
          });

      },
      error => {
        console.log(error);
        // console.log('Member ' + this.member.member_id + ' failed authorisation');
        let t1;
        this.translate.get('Password.Invalid').subscribe(value => t1 = value);
        this.dspSnackbarMsg(t1, 'OK');
        this.isSubmitting = false;
      });
  }

}
