import { Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { Restaurant } from '../_models';
import { AnalyticsService, CMSService } from '../_services';
import { TranslateService } from '@ngx-translate/core';
import { HelpService, LoadService } from '../common';
import { insertAnimation } from '../shared/animations';

@Component({
  selector: 'app-rc-cms-hours',
  templateUrl: './cms-hours.component.html',
  animations: [insertAnimation]
})

export class CmsHoursComponent implements OnInit {

  restaurant: Restaurant;
  openingTimes: any = [];
  openingTimesNotes = '';
  display_dow: any = [];
  dataChanged = false;
  sessionNull = { open: '00:00', close: '00:00' };
  sessionDefault = { open: '08:00', close: '23:00' };
  lastSession = this.sessionDefault;
  maxSessions = 3;

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private ga: AnalyticsService,
    private translate: TranslateService,
    public help: HelpService,
    private loadService: LoadService
  ) {
    this.loadService.open();
  }

  ngOnInit() {
    // get the restaurant data
    this.cmsLocalService.getRestaurant()
      .subscribe({
        next: data => {
          if (data.restaurant_id) {
            this.restaurant = data;
            this.getOpeningTimes();
          }
        },
        error: error => console.log(error)
      });
  }

  getOpeningTimes(): void {

    // Fetches the opening time data from the api
    // This is just to create a reference in BabelEdit
    // const BabelEdit = this.translate.instant('CMS.HOURS.days.0');

    this.cms.getTimes(this.restaurant.restaurant_id).subscribe({
      next: data => {
        const days = this.translate.instant('CMS.HOURS.days');
        // console.log(data);
        this.openingTimes = data['times'];

        if (data['notes'] && data['notes'] !== 'Null') {
          this.openingTimesNotes = data['notes'];
        } else {
          this.openingTimesNotes = '';
        }

        const t = this.openingTimes.length;

        for (let i = 0; i < t; i++) {
          // Set day open checkbox
          this.openingTimes[i].checked = !this.openingTimes[i].closed;
          // Set defaults
          if (!this.openingTimes[i].sessions) {
            this.openingTimes[i].sessions = [this.sessionNull];
          }
          this.display_dow[i] = days[i];
          this.translate.instant('Global.DOW-' + this.openingTimes[i].cms_time_day_of_week);
        }
        this.loadService.close();
        this.dataChanged = false;
      },
      error: error => {
        console.log('Error fetching times', error);
      }
    });
  }

  // Deactivation guard
  confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }

  setChanged(): void {
    // this is activated by user changing a time field
    this.dataChanged = true;
  }

  toggleSession(index): void {

    const t = this.openingTimes[index];

    if (t.closed) {

      // ks fixing bug. Not...
      if (t.sessions.length === 0) {
        t.sessions = [this.lastSession];
      }
      t.closed = 0;

    } else {

      // close with default values
      // t.sessions = [this.sessionNull];
      t.closed = 1;
      t.cms_time_tag = null;
    }

    this.dataChanged = true;
  }

  addSession(index): void {

    const t = this.openingTimes[index];

    // Open with defaults
    if (t.closed) {

      // ks fixing bug. Not...
      // TODO Where is lastSession updated????
      if (t.sessions.length === 0) {
        t.sessions = [this.lastSession];
      }
      t.closed = 0;
      t.checked = 1;
      // Clear any notes
      t.cms_time_tag = null;

    } else {

      // Add new session
      const ls = t.sessions[t.sessions.length - 1];
      t.sessions.push({ open: ls.close, close: ls.close });

    }
    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'hours').subscribe(
      () => {
        console.log('error in updatelastupdatedfield for hours');
      });
    this.dataChanged = true;

    // record event
    this.ga.sendEvent('CMS-Hours', 'Edit', 'Session Added');

  }

  removeSession(index, jndex): void {

    const t = this.openingTimes[index];

    // if this is the last one, then close the session
    if (t.sessions.length === 1) {
      // ks fixing bug. Not...
      // t.sessions = [this.sessionNull];
      t.closed = 1;
      t.checked = 0;
      t.cms_time_tag = null;
    } else {
      // otherwise remove the session indexed
      t.sessions.splice(jndex, 1);
    }
    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'hours').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for hours', error);
      });
    this.dataChanged = true;
    // record event
    this.ga.sendEvent('CMS-Hours', 'Edit', 'Session Removed');
  }

  resetData(): void {
    // restore the original data from the database
    this.getOpeningTimes();
    // record event
    this.ga.sendEvent('CMS-Hours', 'Edit', 'Undo Changes');
  }

  updateData(): void {
    // console.log('OT: ', this.openingTimes, this.openingTimesNotes);
    this.cms.updateTimes(this.openingTimes, this.openingTimesNotes).subscribe({
      next: () => {
        this.cmsLocalService.dspSnackbar(this.translate.instant(
          'CMS.HOURS.msgTimesUpdated',
          { restaurant: this.restaurant.restaurant_name }),
          null, 3);
        this.dataChanged = false;
        // record event
        this.ga.sendEvent('CMS-Hours', 'Edit', 'Changes Saved');
      },
      error: error => {
        console.log(error)
        this.cmsLocalService.dspSnackbar(this.translate.instant('CMS.HOURS.msgUpdateFailed'), null, 3);
      }
    });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'hours')
        .subscribe({
          next: () => {},
          error: () => {
          console.log('error in updatelastupdatedfield for hours');
        }
      });
  }

}
