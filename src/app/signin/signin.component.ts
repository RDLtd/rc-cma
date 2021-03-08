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

  // translation variables
  t_data: any;

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
    // redirect to their 'home' page
    if (this.authService.isAuth()) {
      this.router.navigate([localStorage.getItem('rd_home') || '']);
    }
    this.translate.get('SignIn').subscribe(data => {
      this.t_data = data;
      // console.log('SIGNIN', this.t_data);
    });
  }

  dspNewMemberMessage() {
    const newMember = JSON.parse(sessionStorage.getItem('rc_member_pending'));
    if (!!newMember) {
      this.newMemberEmail = newMember.email;
    }
    this.help.dspHelp('signin-new-member', null, 'Thanks');
  }

  signIn(formValue) {

    // need this in here since the NgInit here executes too soon!
    this.translate.get('SignIn').subscribe(data => {
      this.t_data = data;
    });

    // console.log('form', formValue);
    this.isSubmitting = true;
    this.authService.login(formValue)
      .subscribe(
        authResult => {
          console.log('auth OK');
          this.isSubmitting = false;
          if (authResult && authResult['token']) {
            this.authService.setAuthSession(authResult['member'], authResult['token'], this.dbOffline);
          } else {
            console.log('Auth Failed');
          }
        },
        error => {
          // translation problem here - this error is not translated... Hmmm
          // Indeed, the returned 401 gives the unauthorised, we need to deal with this through translation
          // this.errorMsg = error.statusText;
          console.log(`Auth Error: ${error}`);
          this.openSnackBar(this.t_data.Unauth);
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
        console.log(data);
        if (data['status'] === 'OK') {
          this.openSnackBar(this.t_data.NewPassword);
          this.pwdReset = false;
        } else {
          this.openSnackBar(this.t_data.Unknown);
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
