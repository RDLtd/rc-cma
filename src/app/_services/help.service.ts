import { Injectable } from '@angular/core';
// Don't use shortcut format as it will create a circular ref.
import { HelpComponent } from '../common/help/help.component';
import { MatDialog } from '@angular/material';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class HelpService {

  //demourl: string = 'https://rdltd.github.io/RD.Pages/';

  constructor(
    private dialog: MatDialog,
    private ga: AnalyticsService
  ) { }

  dspHelp(id, restaurant = null) {
    //console.log(id);
    // determine language in order to access correct help files
    const lang = localStorage.getItem('rd_country');
    let header;
    let help_root;
    let dspFooter: boolean = true; // id.indexOf('cms-dashboard') >= 0;
    let btnDemoLabel: string;

    console.log(dspFooter, id);



      switch (lang) {
        // allow for specific countries, and make the default whatever is in the root help folder
        case 'fr': {
          // specific translation here, no need to call the translate module
          header = 'Aide';
          help_root = '/assets/helpfiles/fr/';
          btnDemoLabel = 'Voir la Page Internet de démonstration';
          break;
        }

        default: {
          // assume default is English
          header = 'Help';
          help_root = '/assets/helpfiles/';
          btnDemoLabel = 'VIEW DEMO TEST RESTAURANT SPW';
        }
      }





    console.log('path', help_root + id + '.md');
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
        switch (lang) {
          // allow for specific countries, and make the default whatever is in the root help folder
          case 'fr': {
            window.open('mailto:support@restaurateurs-independants.fr?subject=' + sbj, '_blank');
            break;
          }
          default: {
            // assume default is RC
            window.open('mailto:support@restaurantcollective.uk?subject=' + sbj, '_blank');
          }
        }
      }
      this.dialog.closeAll();
    });
  }

}
