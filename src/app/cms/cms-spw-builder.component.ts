import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'rc-cms-spw-builder',
  templateUrl: './cms-spw-builder.component.html',
  styles: [
  ]
})
export class CmsSpwBuilderComponent implements OnInit {

  buildVersion: string;
  buildStatus: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {

  }

  ngOnInit() {
    this.buildVersion = this.data.buildVersion;
    this.getBuildStatus();
  }

  getBuildStatus(): void {
    const status = ['Gathering content...', 'Building HTML...', 'Deploying Website...', `${this.buildVersion} Complete!`];
    const interval = 2500;
    let delay = 0;
    status.forEach((currentStatus) => {
      setTimeout( () => {
        this.buildStatus = currentStatus;
        console.log(currentStatus);
      }, delay);
      delay += interval;
    });

  }
}
