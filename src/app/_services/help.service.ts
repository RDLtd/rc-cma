import { Injectable } from '@angular/core';
import { HelpComponent } from '../common/help/help.component';
import { MatDialog } from '@angular/material';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class HelpService {

  demourl: string = 'https://rdltd.github.io/RD.Pages/';

  constructor(
    private dialog: MatDialog,
    private ga: AnalyticsService
  ) { }

  dspHelp(id) {
    //console.log(id);
    // determine language in order to access correct help files
    const lang = localStorage.getItem('rd_country');
    let header;
    let help_root;
    let dspFooter: boolean = id.indexOf('cms-dashboard') >= 0;
    let btnDemoLabel: string;

    console.log(dspFooter, id);



      switch (lang) {
        // allow for specific countries, and make the default whatever is in the root help folder
        case 'fr': {
          // specific translation here, no need to call the translate module
          header = 'Aide';
          help_root = '/assets/helpfiles/fr/';
          btnDemoLabel = 'Voir la page de démonstration';
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
        btnLabel: btnDemoLabel
      }
    });

    // record event
    this.ga.sendEvent('Help', id, 'Open Help Dialog');

    dialogRef.afterClosed().subscribe(demo => {
      if (demo) {
        window.open(this.demourl, '_blank');
      }
      this.dialog.closeAll();
    });
  }

}
