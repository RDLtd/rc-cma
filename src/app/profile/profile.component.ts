import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../app.config';
import { LoadService } from '../common';
import { HeaderService } from '../common/header.service';

declare var mozrest: any;

@Component({
  selector: 'app-rc-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  mozId: string;
  mozKey: string;
  moz: any;

  constructor(
      private loader: LoadService,
      private config: AppConfig,
      private headerService: HeaderService
  ) {
    this.loader.open();
    this.headerService.updateSectionName('Profile Management');
    this.mozId = config.mozId;
    this.mozKey = config.mozKey;
  }

  ngOnInit(): void {

    console.log(mozrest);

    this.moz = mozrest.init('mz-sdk', {
      partnerId: '631f357912974fe955677631',
      accessKey: '6332b8947e9f8c135687998a'
    });

    this.moz.showPage('Reviews');
    this.loader.close();

  }

}
