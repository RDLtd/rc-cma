import { Injectable } from '@angular/core';
// Don't use shortcut format as it will create a circular ref.
import { HelpComponent } from '../common';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from './analytics.service';
import { AppConfig } from '../app.config';

@Injectable()
export class HelpService {

  constructor(
    private dialog: MatDialog,
    private ga: AnalyticsService,
    private config: AppConfig
  ) { }

  dspHelp(id, restaurant = null) {
    // console.log(id);
    // determine language in order to access correct help files
    const lang = localStorage.getItem('rd_language');
    let header;
    let help_root;
    let dspFooter: boolean = true; // id.indexOf('cms-dashboard') >= 0;
    let btnDemoLabel: string;

      switch (lang) {
        // allow for specific countries, and make the default whatever is in the root help folder
        case 'fr': {
          // specific translation here, no need to call the translate module
          header = 'Aide';
          help_root = '/assets/helpfiles/fr/';
          btnDemoLabel = 'CONTACTER L\'ASSISTANCE RI';
          break;
        }
        default: {
          // assume default is English
          header = 'Help';
          help_root = '/assets/helpfiles/';
          btnDemoLabel = 'CONTACT RC SUPPORT';
        }
      }
    let dialogRef = this.dialog.open(HelpComponent, {
      width: '480px',
      data: {
        header: header,
        path: help_root + id + '.md',
        footer: dspFooter,
        btnLabel: btnDemoLabel,
        restaurant: restaurant
      }
    });

    // record event
    this.ga.sendEvent('Help', id, 'Open Help Dialog');

    dialogRef.afterClosed().subscribe(email => {

      // Email support request
      if (email) {
        let sbj = `Help Enquiry [${id}]`;
        // Are we in the CMS?
        if (restaurant) {
          sbj = `Re: ${restaurant.restaurant_name} [${restaurant.restaurant_number}]`;
        }
        window.open(`mailto:${this.config.brand.email.support}?subject=${sbj}`, '_blank');
      }
      this.dialog.closeAll();
    });
  }
}
