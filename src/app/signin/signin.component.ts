import { Component, OnInit } from '@angular/core';
import { AuthenticationService, MemberService } from '../_services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../app.config';
import { HelpService } from '../common';

@Component({
  selector: 'rc-signin',
  templateUrl: './signin.component.html'
})

export class SigninComponent implements OnInit {

  isSubmitting: boolean;
  dbOffline: boolean = false;
  errorMsg: string;
  pwdReset: boolean = false;
  brand: string;
  stripeSessionId: any;
  newMemberEmail: string;
  hidePwd = true;

  // translation variables
  trans: any;

  constructor(
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

    this.brand = this.config.brand;

    // Check url params
    this.activeRoute.queryParams.subscribe(params => {
      console.log('Url params', params);
      if (params['session_id']) {
        this.stripeSessionId = params['session_id'];
        this.dspNewMemberMessage();
      }
    });

    // If the user is already signed in
    // redirect to the HUB
    if (this.authService.isAuth()) {
      this.router.navigate(['/hub']);
    }
    this.trans = this.translate.instant('SIGNIN');
  }

  dspNewMemberMessage() {
    const newMember = JSON.parse(sessionStorage.getItem('rc_member_pending'));
    if (!!newMember) {
      this.newMemberEmail = newMember.email;
    }
    this.help.dspHelp('signin-new-settings', null, 'Thanks');
  }

  signIn(formValue) {

    // need this in here since the NgInit here executes too soon!
    // this.translate.get('SignIn').subscribe(data => {
    //   this.SIGNIN = data;
    // });

    // console.log('form', formValue);
    this.isSubmitting = true;
    this.authService.login(formValue)
      .subscribe(
        authResult => {
          console.log('auth OK');
          this.isSubmitting = false;
          if (authResult && authResult['token']) {
            this.authService.setAuthSession(authResult['settings'], authResult['token'], this.dbOffline);
          } else {
            console.log('Auth Failed');
          }
        },
        error => {

          console.log(`Auth Error: ${error}`);
          this.openSnackBar(this.trans.errorUserUnauthorised);
          this.isSubmitting = false;
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
          this.openSnackBar(this.trans.newPwdSent);
          this.pwdReset = false;
        } else {
          this.openSnackBar(this.trans.errorEmailUnknown);
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
