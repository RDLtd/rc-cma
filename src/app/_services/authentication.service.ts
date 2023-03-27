import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { AppConfig } from '../app.config';
import { TranslateService } from '@ngx-translate/core';
import { Member } from '../_models';
import { RestaurantService } from './restaurant.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  public memberSessionSubject = new BehaviorSubject<any>(localStorage.getItem('rd_session'));
  public member: Member = new Member();
  private dbOffline = false;
  private inSession = false;
  // private curation_zone_set: any[] = [];
  private sessionExpiresAt: any;
  private sessionTimeLeft: any;
  private checkingActivity = false;

  private authToken = new BehaviorSubject(new HttpParams().set('Authorization', 'Bearer' +
    '234242423wdfsdvdsfsdrfg34tdfverge'));

  constructor(
    private restaurantService: RestaurantService,
    public snackBar: MatSnackBar,
    private router: Router,
    private http: HttpClient,
    private translate: TranslateService,
    private storage: StorageService,
    private config: AppConfig) {
  }

  public login(form) {
    // console.log('LOGIN', this.authToken);
    return this.http.post(this.config.apiUrl + '/members/authenticate',
      {
        email: form.email,
        company: this.config.brand.prefix,
        password: form.pwd,
        userCode: 'RDL-dev',
        token: this.authToken
      });
  }

  public setMember(member: Member) {
    console.log('setMember', member);
    this.member = member;
  }

  public setAuthSession(member, token, offline): void {

    this.dbOffline = offline;
    this.member = member;

    // Record Member login/authentication

    // Set session variables
    localStorage.setItem('rd_profile', JSON.stringify(member));
    localStorage.setItem('rd_username', `${member.member_first_name} ${member.member_last_name}`);
    localStorage.setItem('rd_access_level', `${member.member_access_level}`);
    localStorage.setItem('rd_token', token);
    localStorage.setItem('rd_session', 'active');

    this.translate.use(localStorage.getItem('rd_language'));
    this.setNewSessionExpiry();
    this.dspHomeScreen('active');
  }

  async dspHomeScreen(sessionStatus): Promise<any> {
    // A deep link set by curation
    const deepLink = this.storage.getSession('rd_route_request');
    // The last viewed restaurant
    const lastViewedRestaurantId = this.storage.get('rd_last_restaurant');
    // Activate session
    this.inSession = (sessionStatus === 'active');
    this.memberSessionSubject.next(sessionStatus);

    // It's a curator so go straight there, do not pass go.
    if(!!deepLink) {
      // clean up & go directly to link
      this.storage.removeSession('rd_route_request');
      this.router.navigate([deepLink]).then();
      return;
    }

    // Otherwise get associated restaurants
    await lastValueFrom(this.restaurantService.getMemberRestaurants(this.member.member_id))
      .then((data) => {
        // If there aren't any then just take the user to settings
        if (data['restaurants'].length < 1) {
          console.log("No associated restaurants at Signin, go to Settings");
          // clean up =, just in case
          this.storage.removeSession('rd_last_restaurant');
          // Go
          this.router.navigate([`/settings`]).then();
          return;
        }

        // If we have an id in storage
        // does it match any associated restaurant
        if(!!lastViewedRestaurantId) {
          data['restaurants'].forEach(restaurant => {
            if (restaurant.restaurant_id === lastViewedRestaurantId) {
              this.router.navigate([`/cms/${lastViewedRestaurantId}`]).then();
              return;
            }
          });
        }
        // If there was a locally stored id, then it didn't match
        // any of the restaurant associated with this account
        const defaultRestaurantId = data['restaurants'][0]['restaurant_id'];
        this.storage.set('rd_last_restaurant', defaultRestaurantId);
        this.router.navigate([`/cms/${defaultRestaurantId}`]).then();

    });
  }

  logout(reason): void {

    console.log(`Logout: ${reason}`);
    this.inSession = false;
    this.memberSessionSubject.next(reason);
    this.member = null;

    // Clear session variables
    window.sessionStorage.clear();

    // Clear storage but keep
    // rd_prefix & rd_language
    localStorage.removeItem('rd_profile');
    localStorage.removeItem('rd_username');
    localStorage.removeItem('rd_token');
    localStorage.removeItem('rd_token_expires_at');
    localStorage.removeItem('rd_access_level');
    localStorage.removeItem('rd_home');
    localStorage.removeItem('rd_session');
  }

  isAuth(): boolean {
    // Check expiry
    this.sessionExpiresAt = JSON.parse(localStorage.getItem('rd_token_expires_at'));
    this.sessionTimeLeft = (this.sessionExpiresAt - new Date().getTime()) / 60000;
    // console.log(`Time left = ${this.sessionTimeLeft > 0? this.sessionTimeLeft : 'none'}`);

    // Does a session still exists?
    if (!!this.sessionExpiresAt && !!this.sessionTimeLeft) {
      // Is there time left?
      if (this.sessionTimeLeft > 0) {
        // How much time is left?
        if (this.sessionTimeLeft < this.config.session_countdown) {
          // Not much time left
          // check for user activity
          if (!this.checkingActivity) {
            console.log(`Less than ${ this.config.session_countdown } min to go, check for activity`);
            this.checkUserActivity();
          }
          // Some time left
          return true;
        } else {
          // Plenty of time left
          return true;
        }

      } else {
        console.log(`In session: ${this.inSession}, Time left: ${this.sessionTimeLeft}`);
        // If session time ends while app is open or when the page has been refreshed
        // or when has navigated away from the page but returns within 5 mins show 'page expired' snackbar
        if (this.inSession || this.sessionTimeLeft > -5) {
          this.logout('expired');
        } else {
          // Otherwise treat as a new session/user
          this.logout('closed');
        }
        return false;
      }
    } else {
      return false;
    }
  }

  // Listen for user activity
  checkUserActivity() {
    const timer = setTimeout(() => {
      console.log('Logging out based on timer');
      this.logout('expired');
      this.router.navigate(['/']).then();
      document.body.removeEventListener('click', reset);
      document.body.removeEventListener('keydown', reset);
    }, 60000);
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
    // create session
    // now + session length
    // session length set in mins so convert to milliseconds
    this.sessionExpiresAt = JSON.stringify(new Date().getTime() + (this.config.session_timeout * (60000)));
    localStorage.setItem('rd_token_expires_at', this.sessionExpiresAt);
  }

  // isAuthLevel(requiredLevel): boolean {
  //   const userLevel = localStorage.getItem('rd_access_level');
  //   // Bump up access level if db is offline
  //   if (this.dbOffline) { requiredLevel = 4; }
  //   return (this.isAuth() && (userLevel >= requiredLevel));
  // }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }
}
