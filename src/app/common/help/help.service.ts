import { Injectable } from '@angular/core';
// Don't use shortcut format as it will create a circular ref.
import { HelpComponent } from './help.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AnalyticsService } from '../../_services';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../../init/config.service';

@Injectable()
export class HelpService {
  lang: string;
  title: string;
  brand: any;
  constructor(
    private dialog: MatDialog,
    private ga: AnalyticsService,
    private config: ConfigService,
    private translate: TranslateService
  ) {
    this.lang  = localStorage.getItem('rd_language');
    this.title = this.translate.instant('HELP.headerDefault');
    config.brand.subscribe(obj => this.brand = obj);
  }

  /**
   * Display a help modal
   * @param topic a reference to the markdown file
   * @param restaurant
   * @param title modal title
   */
  dspHelp(topic, restaurant = null, title = 'help') {

    // console.log(id);
    const lang = localStorage.getItem('rd_language');

    // Content to display
    const mdContentPath = `/assets/helpfiles/${lang}/${topic}.md`;
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
    };

    const dialogRef = this.dialog.open(HelpComponent, dialogConfig);

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
        window.open(`mailto:${this.brand.emails.support}?subject=${sbj}`, '_blank');
      }
      this.dialog.closeAll();
    });
  }
}
