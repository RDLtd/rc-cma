import { Component, OnInit } from '@angular/core';
import { AuthenticationService, ErrorService, MemberService } from '../_services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../app.config';
import { ConfirmCancelComponent } from '../common';
import { MatDialog } from '@angular/material/dialog';

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
    private error: ErrorService
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
    const newMember = JSON.parse(sessionStorage.getItem('app_member_pending'));
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
      .subscribe({
        next: authResult => {
          console.log('auth OK', authResult);
          this.isSubmitting = false;
          if (authResult && authResult['token']) {
            this.authService.setAuthSession(authResult['member'], authResult['token'], this.dbOffline);
          } else {
            // do we need to generate an error here?
            console.log('Auth Failed');
            this.error.handleError('failedToSetSession', 'Unable to set authorisation session!');
          }
        },
        error: error => {
          console.log('Auth Error', error);
          this.isSubmitting = false;
          if (error.status === 401) {
            this.openSnackBar(this.translate.instant('SIGNIN.errorUserUnauthorised'));
          } else {
            // if the server does not respond, we'll get an error status of 0
            if (error.status === 0) {
              this.error.handleError('noServerResponse', error);
            } else {
              // all other errors will be in effect unknown server errors
              this.error.handleError('invalidServerResponse', error);
            }
          }
        }
      });
  }

  showPwdReset(boo: boolean) {
    this.pwdReset = boo;
    this.errorMsg = '';
  }

  resetPwd(formValue) {
    this.memberService.sendrecoveryemail(formValue.email)
        .subscribe({
          next: data => {
            // console.log(data);
            if (data['status'] === 'OK') {
              this.openSnackBar(this.translate.instant('SIGNIN.newPwdSent'));
              this.pwdReset = false;
            } else {
              // it seems this could be any error here, not just Email Unknown? So this should probably be:
              // having said that it probably would make better sense if we sent something with more info from the back end!
              this.error.handleError('failedToSendRecoveryEmail', data['error']);
              // this.openSnackBar(this.translate.instant('SIGNIN.errorEmailUnknown'));
            }
          },
          error: error => {
            // console.log(JSON.stringify(error));
            // this.openSnackBar(error);
            this.error.handleError('failedToSendRecoveryEmail', error);
          }
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
