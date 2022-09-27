import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../app.config';

/**
 * Reference the Mozrest global object loaded
 * via src/assets
 */
declare var MOZ: any;

@Component({
  selector: 'app-rc-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  mozId: string;
  mozKey: string;
  moz: any;

  constructor(private config: AppConfig) {
    this.mozId = config.mozId;
    this.mozKey = config.mozKey;
  }

  ngOnInit(): void {
    // Initialise the MozRest component
    this.moz = MOZ.init({
      token: this.mozKey,
      venueId: '123'
    });
  }

}
