import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { AppConfig } from '../app.config';
import { TranslateService } from '@ngx-translate/core';
import { Member } from '../_models';
import { RestaurantService } from './restaurant.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  public memberSessionSubject = new BehaviorSubject<any>(localStorage.getItem('rd_session'));
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
    //console.log('setMember', member);
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
    localStorage.setItem('rd_session', 'active');

    this.setNewSessionExpiry();

    this.translate.use(member.member_preferred_language);
    localStorage.setItem('rd_country', member.member_preferred_language);

    //console.log('AL: ', member.member_access_level);

    // Set members landing page based on access level
    if (this.dbOffline && member.member_access_level < 4) {
      // Not Super Admin
      localStorage.setItem('rd_home', '/');
      this.dspHomeScreen('active');
    } else {
      // console.log('Access level ' + member.member_access_level);
      switch (member.member_access_level) {
        // 3rd pat agent
        case '0': {
          localStorage.setItem('rd_home', '/agent');
          localStorage.setItem('rd_launch_number', member.member_launch_number);
          this.dspHomeScreen('active');
          break;
        }
        // Curator
        case '1': {
          this.restaurantService.getCurationZoneSet(member.member_id)
            .subscribe(
              data => {
                this.curation_zone_set = data['curation_zone_set'];
                // need to check that there are actually some data!
                if (data['curation_zone_set'].length > 0) {
                  // default is to take the first item on the list - should never be more than 1
                  // but this does not really matter, since the others will be loaded into the dropdown
                  localStorage.setItem('rd_home', '/curationzone/' + this.curation_zone_set[0].curation_id);
                  this.dspHomeScreen('active');
                } else {
                  this.openSnackBar('You have not been assigned a curation zone!', '');
                  localStorage.setItem('rd_home', '/');
                  this.dspHomeScreen('closed');
                }
              },
              error => {
                this.openSnackBar('There was an error trying to access the curation database', '');
                localStorage.setItem('rd_home', '/');
                this.dspHomeScreen('closed');
              });
          break;
        }
        // Restaurant / Content Administrator
        case '2': {
          this.restaurantService.getMemberRestaurants(member.member_id)
            .subscribe(
              data => {
                if (data['count'] > 0) {
                  localStorage.setItem('rd_home', `restaurants/${data['restaurants'][0].restaurant_id}/cms/dashboard`);
                } else {
                  localStorage.setItem('rd_home', '/profile');
                }
                this.dspHomeScreen('active');
                // console.log(data.restaurants[0].restaurant_id);
                // localStorage.setItem('rd_home', '/profile');
              },
              error => {
                console.log(error);
              });

          break;
        }
        // RDL Admin
        case '3': {
          localStorage.setItem('rd_home', '/dashboard');
          this.dspHomeScreen('active');
          break;
        }
        // RDL Developer
        case '4': {
          localStorage.setItem('rd_home', '/dashboard');
          this.dspHomeScreen('active');
          break;
        }
        default: { // undefined
          localStorage.setItem('rd_home', '/profile');
          this.dspHomeScreen('closed')
          break;
        }
      }
    }
  }

  dspHomeScreen(sessionStatus): void {
    sessionStatus === 'active'? this.inSession = true : this.inSession = false;
    this.memberSessionSubject.next(sessionStatus);
    this.router.navigate([localStorage.getItem('rd_home')]);
  }

  logout(reason): void {
    console.log(`Logout: ${reason}`);
    this.inSession = false;
    this.memberSessionSubject.next(reason);
    this.member = null;
    // localStorage.clear();
    localStorage.removeItem('rd_profile');
    localStorage.removeItem('rd_user');
    localStorage.removeItem('rd_token');
    localStorage.removeItem('rd_token_expires_at');
    localStorage.removeItem('rd_access_level');
    localStorage.removeItem('rd_home');
    localStorage.removeItem('rd_session');
  }

  isAuth(): boolean {
    this.sessionExpiresAt = JSON.parse(localStorage.getItem('rd_token_expires_at'));
    this.sessionTimeLeft = (this.sessionExpiresAt - new Date().getTime()) / 60000;
    // Time is up
    if (this.sessionTimeLeft < 0) {
      //this.router.navigate(['/']);
      this.logout('expired');
      return false;
    // Time is running out is anyone using the app?
    } else if (this.sessionTimeLeft < this.config.session_countdown) {
      // Start listening for activity
      if (!this.checkingActivity) {
        console.log(`Less than ${ this.config.session_countdown } mins to go, check for activity`);
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
    const timer = setTimeout(() => {
      this.logout('expired');
      this.router.navigate(['/']);
    }, 5000);
    // Scope reference for the listeners
    const ths = this;
    // Reset the session and clean up
    const reset = function() {
      console.log('Detected activity, reset the session.');
      clearTimeout(timer);
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
    const userLevel = localStorage.getItem('rd_access_level');
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
    // this.http.get(environment.api+ '.feed.json', requestOptions );
    if (currentUser && currentUser.token) {
      requestOptions.params.set('Authorization', 'Bearer ' + currentUser.token);
    } else {
      requestOptions.params.set('Authorization', 'Bearer ' + '234242423wdfsdvdsfsdrfg34tdfverge');
    }
    return requestOptions;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }
}
