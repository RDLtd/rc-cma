import { Component, OnInit } from '@angular/core';
import { LoadService } from '../common';
import { HeaderService } from '../common/header.service';
import { ConfigService } from '../init/config.service';

/**
 * Reference the Mozrest SDK global
 * object loaded in the external js file
 */
declare var mozrest: any;

@Component({
  selector: 'app-rc-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  moz: any;

  constructor(
      private loader: LoadService,
      private config: ConfigService,
      private headerService: HeaderService
  ) {
    this.loader.open();
    this.headerService.updateSectionName('Profile Management');
  }

  ngOnInit(): void {

    console.log(mozrest);

    this.moz = mozrest.init('mz-sdk', {
      partnerId: this.config.mozId,
      accessKey: '633702cd41992e25ef91157c'
    });

    this.moz.showPage();
    this.loader.close();

  }


}
