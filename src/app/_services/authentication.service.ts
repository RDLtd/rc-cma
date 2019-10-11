import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { AppConfig } from '../app.config';
import { TranslateService } from '@ngx-translate/core';;
import { Member } from '../_models';
import { RestaurantService } from './restaurant.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Injectable()

export class AuthenticationService {

  public memberSessionSubject = new Subject<any>();
  public member: Member = new Member();
  private dbOffline = false;
  private inSession: boolean = false;
  curation_zone_set: any[] = [];
  private sessionExpiresAt: any;
  private sessionTimeLeft: any;
  private checkingActivity: boolean = false;

  constructor(
    private restaurantService: RestaurantService,
    public snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient,
    private translate: TranslateService,
    private config: AppConfig) {

  }

  login(form) {
    return this.http.post(this.config.apiUrl + '/members/authenticate',

      {
        email: form.email,
        password: form.pwd,
        userCode: 'RDL-dev',
        token: this.jwt()

      });
  }

  public setMember(member: Member) {
    console.log('setMember', member);
    this.member = member;
  }

  public getLoggedInUser(): Member {
    return this.member;
  }

  public setAuthSession(member, token, offline): void {

    this.dbOffline = offline;

    localStorage.setItem('rd_profile', JSON.stringify(member));
    localStorage.setItem('rd_user', `${member.member_first_name} ${member.member_last_name}`);
    localStorage.setItem('rd_access_level', `${member.member_access_level}`);
    localStorage.setItem('rd_token', token);

    this.setNewSessionExpiry();

    this.translate.use(member.member_preferred_language);
    localStorage.setItem('rd_country', member.member_preferred_language);

    console.log('AL: ', member.member_access_level);

    // Set members landing page based on access level
    if (this.dbOffline && member.member_access_level < 4) {

      // Not Super Admin
      localStorage.setItem('rd_home', '/');
      this.inSession = true;
      this.memberSessionSubject.next('active' );

    } else {



      // console.log('Access level ' + member.member_access_level);
      switch (member.member_access_level) {


        case '0': { // 3rd party agent
          localStorage.setItem('rd_home', '/agent');
          localStorage.setItem('rd_launch_number', member.member_launch_number);
          this.inSession = true;
          this.memberSessionSubject.next('active' );
          this.router.navigate([localStorage.getItem('rd_home')]);
          break;
        }

        case '1': { // Curator
          this.restaurantService.getCurationZoneSet(member.member_id)
            .subscribe(
              data => {
                this.curation_zone_set = data['curation_zone_set'];
                // need to check that there are actually some data!
                if (data['curation_zone_set'].length > 0) {
                  // default is to take the first item on the list - should never be more than 1
                  // but this does not really matter, since the others will be loaded into the dropdown
                  localStorage.setItem('rd_home', '/curationzone/' + this.curation_zone_set[0].curation_id);
                  this.inSession = true;
                  this.memberSessionSubject.next('active' );
                  this.router.navigate([localStorage.getItem('rd_home')]);
                } else {
                  this.openSnackBar('You have not been assigned a curation zone!', '');
                  localStorage.setItem('rd_home', '/');
                  this.inSession = false;
                  this.memberSessionSubject.next('closed' );
                  this.router.navigate([localStorage.getItem('rd_home')]);
                }
              },
              error => {
                this.openSnackBar('There was an error trying to access the curation database', '');
                localStorage.setItem('rd_home', '/');
                this.inSession = false;
                this.memberSessionSubject.next('closed' );
                this.router.navigate([localStorage.getItem('rd_home')]);
              });
          break;
        }
        case '2': { // Member

          this.restaurantService.getMemberRestaurants(member.member_id)
            .subscribe(
              data => {
                if (data['count'] > 0) {
                  localStorage.setItem('rd_home', `restaurants/${data['restaurants'][0].restaurant_id}/cms/dashboard`);
                } else {
                  localStorage.setItem('rd_home', '/profile');
                }
                //console.log(data.restaurants[0].restaurant_id);
                //localStorage.setItem('rd_home', '/profile');
                this.inSession = true;
                this.memberSessionSubject.next('active' );
                this.router.navigate([localStorage.getItem('rd_home')]);
              },
              error => {
                console.log(error);
              });

          break;
        }
        case '3': { // RDL Admin
          localStorage.setItem('rd_home', '/dashboard');
          this.inSession = true;
          this.memberSessionSubject.next('active' );
          this.router.navigate([localStorage.getItem('rd_home')]);
          break;
        }
        case '4': { // RDL Developer
          localStorage.setItem('rd_home', '/dashboard');
          this.inSession = true;
          this.memberSessionSubject.next('active' );
          this.router.navigate([localStorage.getItem('rd_home')]);
          break;
        }
        default: { // undefined
          localStorage.setItem('rd_home', '/profile');
          this.memberSessionSubject.next('closed' );
          this.router.navigate([localStorage.getItem('rd_home')]);
          break;
        }
      }
    }
      //
      // // RDL Admin
      // if (member.member_access_level > 2) {
      //
      //   localStorage.setItem('rd_home', '/dashboard');
      //
      //   // RC Member
      // } else {
      //
      //   if (member.member_access_level === 2) {
      //
      //     // regular member = 2
      //     localStorage.setItem('rd_home', '/profile');
      //     console.log('Profile');
      //
      //   } else {
      //
      //     if (member.member_access_level === 1) {
      //
      //       // curator = 1
      //       console.log('Curator');
      //       this.restaurantService.getCurationZoneSet(member.member_id)
      //         .subscribe(
      //           data => {
      //             this.curation_zone_set = data.curation_zone_set;
      //             // need to check that there are actually some data!
      //             if (data.curation_zone_set.length > 0) {
      //               // default is to take the first item on the list - should never be more than 1
      //               // but this does not really matter, since the others will be loaded into the dropdown
      //               localStorage.setItem('rd_home', '/curationzone/' + this.curation_zone_set[0].curation_id);
      //             } else {
      //               this.openSnackBar('You have not been assigned a curation zone!', '');
      //               localStorage.setItem('rd_home', '/');
      //             }
      //           },
      //           error => {
      //             // this.openSnackBar('There was an error trying to access the curation database', '');
      //           });
      //     } else {
      //
      //       localStorage.setItem('rd_home', '/');
      //
      //     }
      //   }
      // }
      // }

    // this.inSession = true;

    // Notify observers
    // this.memberSessionSubject.next('active' );
  }

  logout(reason): void {
    this.member = null;
    //localStorage.clear();
    localStorage.removeItem('rd_profile');
    localStorage.removeItem('rd_user');
    localStorage.removeItem('rd_token');
    localStorage.removeItem('rd_token_expires_at');
    localStorage.removeItem('rd_access_level');
    localStorage.removeItem('rd_home');
    if (this.inSession) {
      this.inSession = false;
      this.memberSessionSubject.next(reason);
    }
  }

  isAuth(): boolean {

    this.sessionExpiresAt = JSON.parse(localStorage.getItem('rd_token_expires_at'));
    this.sessionTimeLeft = (this.sessionExpiresAt - new Date().getTime())/60000;

    //console.log(this.sessionTimeLeft);

    // Time is up
    if(this.sessionTimeLeft < 0) {

      this.logout('expired');
      return false;

    // Time is running out is anyone using the app?
    } else if (this.sessionTimeLeft < this.config.session_countdown) {

      // Start listening for activity
      if (!this.checkingActivity) {
        console.log(`Less than ${ this.config.session_countdown } mins to go, check for activity`)
        this.checkUserActivity();
      }

      return true;

    // Plenty of time left
    } else {

      return true;

    }

  }

  // Listen for user activity
  checkUserActivity() {

    // Scope reference for the listeners
    let ths = this;

    // Reset the session and clean up
    let reset = function(){
      console.log('Detected activity, reset the session.');
      ths.setNewSessionExpiry();
      document.body.removeEventListener('click', reset);
      document.body.removeEventListener('keydown', reset);
      ths.checkingActivity = false;
    };

    // Listen for user activity
    this.checkingActivity = true;
    document.body.addEventListener('click', reset);
    document.body.addEventListener('keydown', reset);
  }

  setNewSessionExpiry() {

    this.sessionExpiresAt = JSON.stringify(new Date().getTime() + (this.config.session_timeout * (60 * 1000)));
    localStorage.setItem('rd_token_expires_at', this.sessionExpiresAt);

  }

  isAuthLevel(requiredLevel): boolean {

    let userLevel = localStorage.getItem('rd_access_level');

    // Bump up access level if db is offline
    if (this.dbOffline) { requiredLevel = 4; }
    return (this.isAuth() && (userLevel >= requiredLevel));
  }

  // generate token
  private jwt(): any {
    // create authorization header with jwt token
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const requestOptions = {
      params: new HttpParams()
    };
    requestOptions.params.set('foo', 'bar');
    requestOptions.params.set('apiCategory', 'Financial');

    //this.http.get(environment.api+ '.feed.json', requestOptions );

    if (currentUser && currentUser.token) {
      // const headers = new Headers({
      //   'Authorization': 'Bearer ' + currentUser.token,
      //   'apiCategory': 'Financial'
      // });
      // return new RequestOptions({ headers: headers });
      requestOptions.params.set('Authorization', 'Bearer ' + currentUser.token);
    } else {
      // if there is no user, then we must invent a token
      // const headers = new Headers({
      //   'Authorization': 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge',
      //   'apiCategory': 'Financial'
      // });
      // return new RequestOptions({ headers: headers });
      requestOptions.params.set('Authorization', 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge');
    }
    return requestOptions;

    // // create authorization header with jwt token
    // const token = localStorage.getItem('rd_token');
    // if (token) {
    //   const headers = new Headers({
    //     'Authorization': 'Bearer ' + token ,
    //     'apiCategory': 'Authenticate'
    //   });
    //   return new RequestOptions({ headers: headers });
    // } else {
    //   // if there is no user, then we must invent a token
    //   const headers = new Headers({
    //     'Authorization': 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge' ,
    //     'apiCategory': 'Authenticate'
    //   });
    //   return new RequestOptions({ headers: headers });
    //}
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

}
