import { Component, OnInit } from '@angular/core';
import { Restaurant } from '../_models';
import { CMSService } from '../_services';
import { RestaurantService } from '../_services';
import { CmsLocalService } from './cms-local.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmCancelComponent } from '../common';
import { RestaurantDetailComponent } from '../restaurants';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfig } from '../app.config';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'rc-cms-directory',
  templateUrl: './cms-directory.component.html'
})
export class CmsDirectoryComponent implements OnInit {

  showLoader: boolean = false;
  restaurant: Restaurant;
  originalrestaurant = new Restaurant;
  cancelSetting: Boolean;
  verification_due: Boolean;
  d_restaurant_verified_on: string;

  // translation variables
  t_data: any;

  constructor(
    private cmsLocalService: CmsLocalService,
    public snackBar: MatSnackBar,
    private cms: CMSService,
    private config: AppConfig,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    private dialog: MatDialog) {
    translate.onLangChange.subscribe(() => {
      this.translate.get('CMS-Directory').subscribe(data => {
        this.t_data = data;
      });
      moment.locale(localStorage.getItem('rd_language'));
      this.d_restaurant_verified_on = moment(this.restaurant.restaurant_verified_on).format('dddd, DD MMMM YYYY');
    });
  }

  ngOnInit() {

    this.showLoader = true;
    moment.locale(localStorage.getItem('rd_language'));

    this.cmsLocalService.getRestaurant()

      .subscribe(data => {
          this.restaurant = data;

          // make a copy of the original so we can compare later
          for (let key in this.restaurant) {
            if (this.restaurant.hasOwnProperty(key)) {
              this.originalrestaurant[key] = this.restaurant[key];
            }
          }

          // check to see if we need to remind the member to verify
          if (this.restaurant.restaurant_verified_by) {
            // see if the time interval has elapsed
            const verified_date = new Date(this.restaurant.restaurant_verified_on);
            const now = new Date();
            const duration = now.valueOf() - verified_date.valueOf();
            const diffDays = Math.ceil(duration / (1000 * 3600 * 24));

            this.verification_due = diffDays >= this.config.restaurant_verification_days;
          }
          this.d_restaurant_verified_on = moment(this.restaurant.restaurant_verified_on).format('dddd, DD MMMM YYYY');
          this.showLoader = false;

        },
        error => console.log(error));

    this.translate.get('CMS-Directory').subscribe(data => {
      this.t_data = data;
    });
  }


  verifyDirectoryData(): void {
    const data = {
      title: this.t_data.DataVerification,
      msg: this.t_data.Knowledge + this.restaurant.restaurant_name + this.t_data.Correct,
      no: this.t_data.No,
      yes: this.t_data.Yes
    };

    const dialogRef = this.dialog.open(ConfirmCancelComponent, { data });
    dialogRef.afterClosed().subscribe(result => {
      if (result.confirmed) {
        const currentMember = JSON.parse(localStorage.getItem('rd_profile'));
        const displayDate = new Date().toLocaleDateString();
        console.log(`Data for ${this.restaurant.restaurant_name} verified by ` +
          currentMember.member_first_name + ' ' + currentMember.member_last_name + ' on ' + displayDate);
        this.restaurantService.verify(this.restaurant.restaurant_id,
          currentMember.member_first_name + ' ' + currentMember.member_last_name )
          .subscribe(() => {
              this.openSnackBar(this.t_data.Verified, '');
              this.restaurant.restaurant_verified_by = currentMember.member_first_name +
                ' ' + currentMember.member_last_name;
              this.restaurant.restaurant_verified_on = Date().toLocaleString();
              this.originalrestaurant.restaurant_verified_by = currentMember.member_first_name +
                ' ' + currentMember.member_last_name;
              this.originalrestaurant.restaurant_verified_on = Date().toLocaleString();
              this.verification_due = false;
            },
            error => console.log(error));
      }
    });
  }

  reqDirectoryDataChange(): void {
    const currentMember = JSON.parse(localStorage.getItem('rd_profile'));
    console.log(`Request change for ${this.restaurant.restaurant_name}` + ' by ' +
      currentMember.member_first_name + ' ' + currentMember.member_last_name);

    const dialogRef = this.dialog.open(RestaurantDetailComponent);

    // Setup dialog vars
    dialogRef.componentInstance.restaurant = this.restaurant;
    dialogRef.componentInstance.editMode = true;
    dialogRef.componentInstance.fromCMS = true;
    dialogRef.componentInstance.cancelSetting = true; // this so we can detect clicks outside the box

    // Whenever the dialog is closed
    dialogRef.afterClosed().subscribe(() => {
      // Create a hook into the dialog form
      const f: NgForm = dialogRef.componentInstance.restForm;

      this.cancelSetting = dialogRef.componentInstance.cancelSetting;
      if (f.dirty && !this.cancelSetting) {
        if (f.valid) {
          console.log('Form OK, now compose an email to RDL requesting change');
          // iterate through the fields and detect which have changed...
          let changeArray = [];
          for (let key in this.restaurant) {
            if (this.restaurant.hasOwnProperty(key)) {
              if (this.restaurant[key] !== this.originalrestaurant[key]) {
                changeArray.push({ key: key.replace('restaurant_', ''),
                  was: this.originalrestaurant[key], now: this.restaurant[key] });
              }
            }
          }
          console.log(changeArray.length + ' changes detected');
          // send information to the server so that emails can be generated
          this.cms.sendRestaurantChanges(currentMember, this.restaurant, changeArray)
            .subscribe(data => {
                console.log('Emails generated by server');
                console.log(data);
                this.openSnackBar(this.t_data.Request, '');
              },
              error => console.log(error));
          // now need to revert the data since this was ONLY A REQUEST
          for (let key in this.restaurant) {
            if (this.restaurant.hasOwnProperty(key)) {
              this.restaurant[key] = this.originalrestaurant[key];
            }
          }
        } else {
          console.log('Form invalid, return message');
          // now need to revert the data since this was ONLY A REQUEST
          for (let key in this.restaurant) {
            if (this.restaurant.hasOwnProperty(key)) {
              this.restaurant[key] = this.originalrestaurant[key];
            }
          }
        }
      } else {
        console.log('As you were, nothing changed');
        // now need to revert the data since this was ONLY A REQUEST
        for (let key in this.restaurant) {
          if (this.restaurant.hasOwnProperty(key)) {
            this.restaurant[key] = this.originalrestaurant[key];
          }
        }
      }
    });
  }

  openUrl(url) {

    if (url.indexOf('//') === -1) {
      url = 'http://' + url;
    }
    window.open(url, '_blank');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

}


