import { Injectable } from '@angular/core';
// Don't use shortcut format as it will create a circular ref.
import { HelpComponent } from './help.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AnalyticsService } from '../../_services';
import { AppConfig } from '../../app.config';

@Injectable()
export class HelpService {
  constructor(
    private dialog: MatDialog,
    private ga: AnalyticsService,
    private config: AppConfig
  ) { }

  dspHelp(topic, restaurant = null, title = 'help') {

    // console.log(id);
    const lang = localStorage.getItem('rd_language');

    // Content to display
    let mdContentPath = `/assets/helpfiles/${lang}/${topic}.md`;
    console.log(mdContentPath);

    // Support button
    let btnLabel = 'OK';

    // If it's a Help dialog
    if (title === 'help' && lang === 'fr') {
      title = 'Aide';
      btnLabel = 'OK';
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '480px';
    dialogConfig.data = {
      type: title,
      path: mdContentPath,
      btnLabel: btnLabel,
      restaurant: restaurant,
    }

    let dialogRef = this.dialog.open(HelpComponent, dialogConfig);

    // Record GA Event
    this.ga.sendEvent('Help', topic, 'Open Help Dialog');

    dialogRef.afterClosed().subscribe(email => {
      // Email support request
      if (email) {
        let sbj = `Help Enquiry [${topic}]`;
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
