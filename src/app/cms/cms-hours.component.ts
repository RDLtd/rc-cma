import { Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { Restaurant } from '../_models';
import { AnalyticsService, CMSService, HelpService } from '../_services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-cms-hours',
  templateUrl: './cms-hours.component.html'
})

export class CmsHoursComponent implements OnInit {

  restaurant: Restaurant;
  openingTimes: any = [];
  openingTimesNotes: string = "";
  display_dow: any = [];
  dataChanged = false;
  sessionNull = { open: '00:00', close: '00:00' };
  sessionDefault = { open: '08:00', close: '23:00' };
  lastSession = this.sessionDefault;
  maxSessions = 3;
  showLoader: boolean = false;

  // translation variables
  t_data: any;

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private ga: AnalyticsService,
    private translate: TranslateService,
    public help: HelpService
  ) {
    // detect language changes... need to check for change in texts
    translate.onLangChange.subscribe(lang => {
      this.translate.get('CMS-Hours').subscribe(data => { this.t_data = data; });
      const t = this.openingTimes.length;
      for (let i = 0; i < t; i++) {
        this.translate.get('Global.DOW-' + this.openingTimes[i].cms_time_day_of_week).
        subscribe(value => { this.display_dow[i] = value; });
      }
    });
  }

  ngOnInit() {
    // get the restaurant data
    this.cmsLocalService.getRestaurant()
      .subscribe(data => {
          if (data.restaurant_id) {
            this.restaurant = data;
            this.getOpeningTimes();
          }
        },
        error => console.log(error));

    this.translate.get('CMS-Hours').subscribe(data => {
      this.t_data = data;
    });
  }

  getOpeningTimes(): void {

    this.showLoader = true;

    // get the opening time data from the api
    this.cms.getTimes(this.restaurant.restaurant_id).subscribe(
      data => {
        console.log('TIMES DATA', data);
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
          // update 041118, need somehow to deal with updates to DOW, but these are loaded from the DB in English!
          // This is wrong - need to put in a temp variable, not overwrite the data!
          // Fixed 11/07/19 ks
          // this.translate.get('Global.DOW-' + this.openingTimes[i].cms_time_day_of_week).
          //   subscribe(value => { this.openingTimes[i].cms_time_day_of_week = value; });
          // console.log('Global.DOW-' + this.openingTimes[i].cms_time_day_of_week);
          this.translate.get('Global.DOW-' + this.openingTimes[i].cms_time_day_of_week).
            subscribe(value => { this.display_dow[i] = value; });
        }
        this.showLoader = false;
        this.dataChanged = false;
      },
      error => {
        console.log('Error fetching times', error);
      });
  }

  // Deactivation guard
  confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    }else {
      return true;
    }
  }

  setChanged(): void {
    // this is activated by user changing a time field
    this.dataChanged = true;
  }

  toggleSession(index): void {

    let t = this.openingTimes[index];

    if (t.closed) {

      t.sessions = [this.lastSession];
      t.closed = 0;

    } else {

      // close with default values
      t.sessions = [this.sessionNull];
      t.closed = 1;
      t.cms_time_tag = null;
    }

    this.dataChanged = true;
}

  addSession(index): void {

    let t = this.openingTimes[index];

    // Open with defaults
    if (t.closed) {

      t.sessions = [this.lastSession];
      t.closed = 0;
      t.checked = 1;
      // Clear any notes
      t.cms_time_tag = null;

    } else {

      // Add new session
      let ls = t.sessions[t.sessions.length - 1];
      t.sessions.push({ open: ls.close, close: ls.close });

    }
    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'hours').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for hours', error);
      });
    this.dataChanged = true;

    // record event
    this.ga.sendEvent('CMS-Hours', 'Edit', 'Session Added');

  }

  removeSession(index, jndex): void {

    let t = this.openingTimes[index];

    // if this is the last one, then close the session
    if (t.sessions.length === 1) {
      t.sessions = [this.sessionNull];
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
    console.log('OT: ', this.openingTimes, this.openingTimesNotes);
    this.cms.updateTimes(this.openingTimes, this.openingTimesNotes).subscribe(
      data => {
        // console.log(JSON.stringify(data));
        console.log('Data for CMS Times updated');
        this.cmsLocalService.dspSnackbar(this.restaurant.restaurant_name + this.t_data.TimesUpdated, null, 3);
        this.dataChanged = false;

        // record event
        this.ga.sendEvent('CMS-Hours', 'Edit', 'Changes Saved');
      },
      error => {
        console.log(JSON.stringify(error));
        this.cmsLocalService.dspSnackbar(this.t_data.UpdateFailed, null, 3);
      });
    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'hours').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for hours', error);
      });
  }

}
