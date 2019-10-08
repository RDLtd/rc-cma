import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';;
import { MatSidenav } from '@angular/material';
import { AuthenticationService } from './_services';
//import { PageScrollConfig } from 'ng2-page-scroll';
import { Http } from '@angular/http';
import { AppConfig } from './app.config';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'rc-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {

  title;
  member: any;
  language;

  @ViewChild('MdSidenav')

  private sidenav: MatSidenav;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private http: Http,
    private config: AppConfig,
    public authService: AuthenticationService) {

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

    if (localStorage.getItem('rd_country')) {
      this.language = localStorage.getItem('rd_country');
    } else {
      // if no local item found, then set to English
      this.language = 'en';
    }

    // override the language settings based on the country in which the client resides
    if (this.config.use_ip_location) {
      this.getCountry().subscribe(
        data => {
          if (data.country === 'FR') {
            this.language = 'fr';
          } else {
            this.language = 'en';
          }
        },
        error => {
          console.log(JSON.stringify(error));
          this.language = 'en';
        });
    }

    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    localStorage.setItem('rd_country', this.language);
    this.setCompany(this.language);
    this.title = localStorage.getItem('rd_company_name');

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
    localStorage.setItem('rd_company_currency_symbol', my_company.rd_company_currency_symbol);
    localStorage.setItem('rd_company_currency_code', my_company.rd_company_currency_code);
  }

  getCountry () {
    return this.http.get('https://ipinfo.io?token=b3a0582a14c7a4').map(res => res.json());
  }

  onDeactivate() {
    // console.log('onDeactivate');
    // document.body.scrollTop = 0;
    // Alternatively, you can scroll to top by using this other call:
    window.scrollTo(0, 0)
  }
}
