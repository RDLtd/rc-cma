import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../app.config';
import { LoadService } from '../common';
import { HeaderService } from '../common/header.service';

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
      private config: AppConfig,
      private headerService: HeaderService
  ) {
    this.loader.open();
    this.headerService.updateSectionName('Profile Management');
  }

  ngOnInit(): void {

    console.log(mozrest);

    this.moz = mozrest.init('mz-sdk', {
      partnerId: this.config.mozId,
      accessKey: '6336a072d8099b544cb83a0f'
    });

    this.moz.showPage();
    this.loader.close();

  }


}
