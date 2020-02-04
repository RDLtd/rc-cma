import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatSidenav } from '@angular/material';
import { AuthenticationService } from './_services';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from './app.config';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ConnectionService } from 'ng-connection-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'rc-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {

  title;
  member: any;
  language = 'en'; // Default language


  connectionOffline = {
    en: "You are currently OFFLINE, please check your internet connection.",
    fr: "Vous êtes actuellement OFFLINE! Veuillez vérifier votre connexion Internet.",
  };

  sessionExpired = {
    en: "Your session has expired. To continue using the application, please Sign In again.",
    fr: "Votre session a expiré. Pour continuer à utiliser l’application, veuillez vous connecter à nouveau.",
  };

  isConnected = true;
  inSession = false;
  @ViewChild('MdSidenav', {static: true})

  private sidenav: MatSidenav;

  constructor(
    private connectionService:ConnectionService,
    private snackBar: MatSnackBar,
    private _dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient,
    private config: AppConfig,
    private activeRoute: ActivatedRoute,
    public authService: AuthenticationService) {

      // Check browser connection
      this.connectionService.monitor().subscribe(isConnected => {
        this.isConnected = isConnected;
        if(this.isConnected){
          snackBar.dismiss();
        } else {
          const snackBarRef = snackBar.open(this.connectionOffline[this.language], 'OK', {
            verticalPosition: 'top',
            panelClass: ['rc-mat-snack-info']
          });
        }
      });

      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          (<any>window).ga('set', 'page', event.urlAfterRedirects);
          (<any>window).ga('send', 'pageview');
        }
      });

  }

  ngOnInit() {

    // this.router.events.subscribe((_: NavigationEnd) => {
    //   this.notSignIn = (_.url != '/' && _.url != '/signin' && _.url != '/login');
    //   console.log(_.url);
    // });

    console.log('API is currently : ' + this.config.apiUrl);

    // check for country preference in local storage
    this.translate.addLangs(['en', 'fr']);
    // Set country default to 'en' if not defined
    this.language = localStorage.getItem('rd_country') || 'en';

    // override the language settings based on the country in which the client resides
    if (this.config.use_ip_location) {
      this.setCountryLanguage();
    }

    // Observe the session status
    this.authService.memberSessionSubject.subscribe(
      sessionStatus => {
        console.log('sessionStatus', sessionStatus);
        switch(sessionStatus) {
          case 'active': {
            this.inSession = true;
            break;
          }
          case 'expired': {
            this.inSession = false;
            // In case any dialogs are open when the app times out
            this._dialog.closeAll();
            // Tell the user what happened
            const snackBarRef = this.snackBar.open(
              this.sessionExpired[this.language],
              'OK',
              {
              verticalPosition: 'top',
              panelClass: ['rc-mat-snack-info']
            });
            break;
          }
          default: {
            this.inSession = false;
          }
        }
      }
    );

    // PageScrollConfig.defaultScrollOffset = 64;
    // PageScrollConfig.defaultEasingLogic = {
    //   ease: (t: number, b: number, c: number, d: number): number => {
    //     // easeInOutExpo easing
    //     if (t === 0) return b;
    //     if (t === d) return b + c;
    //     if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    //     return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    //   }
    // };
  }

  setCompany (country_code) {
    // sets the company up according to the country code, data are configured in app.config
    let my_company;
    if (country_code === 'en') {
      my_company = this.config.en_company;
    } else {
      my_company = this.config.fr_company;
    }
    console.log('LS', my_company.rd_company_name);

    localStorage.setItem('rd_company_name', my_company.rd_company_name);
    localStorage.setItem('rd_company_logo_root', my_company.rd_company_logo_root);
    localStorage.setItem('rd_company_url', my_company.rd_company_url);
    localStorage.setItem('rd_company_monthly_fee', my_company.rd_company_monthly_fee);
    localStorage.setItem('rd_company_annual_fee', my_company.rd_company_annual_fee);
    localStorage.setItem('rd_company_annual_fee_with_vat', my_company.rd_company_annual_fee_with_vat);
    localStorage.setItem('rd_company_currency_symbol', my_company.rd_company_currency_symbol);
    localStorage.setItem('rd_company_currency_code', my_company.rd_company_currency_code);
    localStorage.setItem('rdCompanyConfig', '');

  }

  setCountryLanguage(){
    this.http.get('https://ipinfo.io?token=b3a0582a14c7a4')
      .subscribe(
        data => {
          if (data['country'] === 'FR' || data['country'] === 'ZA') {
            this.language = 'fr';
          } else {
            this.language = 'en';
          }
          console.log('language is ' + this.language + ' from IP');
          this.translate.setDefaultLang(this.language);
          this.translate.use(this.language);
          localStorage.setItem('rd_country', this.language);
          this.setCompany(this.language);
          this.title = localStorage.getItem('rd_company_name');
        },
        error => {
        }
      );
  }

  // getCountry () {
  //   console.log('Get Country by IP');
  //   setTimeout (() => {
  //     console.log('No response from IPINFO');
  //     return null;
  //   }, 5000);
  //   return this.http.get('https://ipinfo.io?token=b3a0582a14c7a4');
  // }

  onDeactivate() {
    // console.log('onDeactivate');
    // document.body.scrollTop = 0;
    // Alternatively, you can scroll to top by using this other call:
    window.scrollTo(0, 0)
  }


}
