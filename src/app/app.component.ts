import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './_services';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from './app.config';
import { NavigationEnd, Router } from '@angular/router';
//import { ConnectionService } from 'ng-connection-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-rc-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {

  isConnected = true;
  inSession: boolean;
  language = localStorage.getItem('rd_language'); // Default language

  // If we are offline then there is no access to translations
  connectionOffline = {
    en: 'You are currently OFFLINE, please check your internet connection.',
    fr: 'Vous êtes actuellement OFFLINE! Veuillez vérifier votre connexion Internet.',
  };
  sessionExpired = {
    en: 'Your session has expired. To continue using the application, please Sign In again.',
    fr: 'Votre session a expiré. Pour continuer à utiliser l’application, veuillez vous connecter à nouveau.',
  };

  constructor(
    //private connectionService: ConnectionService,
    private snackBar: MatSnackBar,
    private _dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient,
    private config: AppConfig,
    public authService: AuthenticationService) {




      // Record navagation analytics
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          (<any>window).ga('set', 'page', event.urlAfterRedirects);
          (<any>window).ga('send', 'pageview');
        }
      });

  }

  ngOnInit() {

    // Output Settings
    console.log(`API: ${this.config.apiUrl}`);
    console.log(`Brand: ${this.config.brand.name}`);
    console.log(`Language: ${this.language}`);
    console.log(`Locale: ${localStorage.getItem('rd_locale')}`);
    console.log(`Session length: ${this.config.session_timeout} mins`);
    console.log(`Session countdown from : ${this.config.session_countdown} min.`);

    // Observe the session status
    this.authService.memberSessionSubject.subscribe(
      sessionStatus => {
        // console.log('sessionStatus', sessionStatus);
        switch (sessionStatus) {
          case 'active': {
            this.inSession = true;
            break;
          }
          case 'expired': {
            console.log('EXP');
            this.inSession = false;
            // In case any dialogs are open when the app times out
            this._dialog.closeAll();
            // Tell the user what happened
            this.snackBar.open(
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
  }

  onDeactivate() {
    // console.log('onDeactivate');
    // document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }
}
