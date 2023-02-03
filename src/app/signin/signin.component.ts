import { Component, OnInit } from '@angular/core';
import { AuthenticationService, MemberService } from '../_services';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../app.config';
import { ConfirmCancelComponent, HelpService } from '../common';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html'
})

export class SigninComponent implements OnInit {

  isSubmitting: boolean;
  dbOffline = false;
  errorMsg: string;
  pwdReset = false;
  brandName: string;
  stripeSessionId: any;
  newMemberEmail: string;
  hidePwd = true;

  constructor(
    private dialog: MatDialog,
    private authService: AuthenticationService,
    private memberService: MemberService,
    public snackBar: MatSnackBar,
    private translate: TranslateService,
    private activeRoute: ActivatedRoute,
    private config: AppConfig,
    private router: Router,
    private help: HelpService
  ) {  }

  ngOnInit() {

    this.brandName = this.config.brand.name;

    // Check url params
    this.activeRoute.queryParams.subscribe(params => {
      // console.log('Url params', params);
      if (params['session_id']) {
        this.stripeSessionId = params['session_id'];
        this.dspNewMemberMessage();
      }
      if (params['member']) {
        this.dspNewMemberMessage();
      }
    });

    // If the user is already signed in
    // redirect to the HUB
    if (this.authService.isAuth()) {
      this.router.navigate(['/hub']).then();
    }
  }

  dspNewMemberMessage() {
    const newMember = JSON.parse(sessionStorage.getItem('rc_member_pending'));
    if (!!newMember) {
      this.newMemberEmail = newMember.email;
    }
    this.dialog.open(ConfirmCancelComponent, {
      data: {
        title: this.translate.instant('SIGNIN.titleThanks'),
        body: this.translate.instant('SIGNIN.msgNewMember'),
        confirm: 'OK',
        cancel: 'hide'
      }
    });
  }

  signIn(formValue) {

    // console.log('form', formValue);
    this.isSubmitting = true;
    this.authService.login(formValue)
      .subscribe(
        authResult => {
          console.log('auth OK', authResult);
          this.isSubmitting = false;
          if (authResult && authResult['token']) {
            this.authService.setAuthSession(authResult['member'], authResult['token'], this.dbOffline);
          } else {
            console.log('Auth Failed');
          }
        },
        error => {
          console.log(`Auth Error: ${error}`);
          this.isSubmitting = false;
          this.openSnackBar(this.translate.instant('SIGNIN.errorUserUnauthorised'));

        });
  }

  showPwdReset(boo: boolean) {
    this.pwdReset = boo;
    this.errorMsg = '';
  }

  resetPwd(formValue) {
    this.memberService.sendrecoveryemail(formValue.email).subscribe(
      data => {
        // console.log(data);
        if (data['status'] === 'OK') {
          this.openSnackBar(this.translate.instant('SIGNIN.newPwdSent'));
          this.pwdReset = false;
        } else {
          this.openSnackBar(this.translate.instant('SIGNIN.errorEmailUnknown'));
        }
      },
      error => {
        console.log(JSON.stringify(error));
        this.openSnackBar(error);
      });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

}
