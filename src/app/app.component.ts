import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './_services';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { OnlineStatusService, OnlineStatusType } from 'ngx-online-status';
import { ConfigService } from './init/config.service';

@Component({
  selector: 'app-rc-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {

  isConnected = true;
  inSession: boolean;
  isSecure:boolean;
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
    private onlineStatusService: OnlineStatusService,
    private snackBar: MatSnackBar,
    private _dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    private http: HttpClient,
    private config: ConfigService,
    public authService: AuthenticationService) {

      this.checkProtocol();

      // Record navigation analytics
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          (<any>window).ga('set', 'page', event.urlAfterRedirects);
          (<any>window).ga('send', 'pageview');
        }
      });

  }

  checkProtocol(): void {
    if (window.location.protocol.includes('https')) {
      return;
    }
    // Redirect to https
    console.log('Redirecting to HTTPS');
    window.location.href = window.location.toString().replace('http', 'https');
  }

  ngOnInit() {

    this.config.displayConfig();

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

    this.onlineStatusService.status.subscribe((status: OnlineStatusType) => {
      // use status
      this.isConnected = (status === 1);
      if(!this.isConnected) {
        this.snackBar.open(this.connectionOffline[this.language], null, {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: 'rc-mat-snack-warn'
        });
      } else {
        this.snackBar.dismiss()
      }

    });
  }

  onDeactivate() {
    // console.log('onDeactivate');
    // document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }
}
