import { Component, OnInit } from '@angular/core';
import { Restaurant } from '../_models/restaurant';
import { CMSService } from '../_services/cms.service';
import { RestaurantService } from '../_services/restaurant.service';
import { CmsLocalService } from './cms-local.service';
import { MatDialog } from '@angular/material';
import { ConfirmCancelComponent } from '../confirm-cancel/confirm-cancel.component';
import { RestaurantDetailComponent } from '../restaurants/restaurant-detail.component';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { AppConfig } from '../app.config';
import { TranslateService } from '@ngx-translate/core';;

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

  // translation variables
  t_data: any;

  constructor(
    private cmsLocalService: CmsLocalService,
    public snackBar: MatSnackBar,
    private cms: CMSService,
    private config: AppConfig,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    private dialog: MatDialog) { }

  ngOnInit() {

    this.showLoader = true;

    this.cmsLocalService.getRestaurant()

      .subscribe(data => {
          this.restaurant = data;

          // make a copy of the original so we can compare later
          for (let key in this.restaurant) {
            this.originalrestaurant[key] = this.restaurant[key];
          }

          // check to see if we need to remind the member to verify
          if (this.restaurant.restaurant_verified_by) {
            // see if the time interval has elapsed
            const verified_date = new Date(this.restaurant.restaurant_verified_on);
            const now = new Date();
            const duration = now.valueOf() - verified_date.valueOf();
            const diffDays = Math.ceil(duration / (1000 * 3600 * 24));

            if (diffDays < this.config.restaurant_verification_days) {
              this.verification_due = false;
            } else {
              this.verification_due = true;
            }
          }

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
          .subscribe(data => {
              // console.log(data);
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
    dialogRef.afterClosed().subscribe(result => {
      // Create a hook into the dialog form
      const f: NgForm = dialogRef.componentInstance.restForm;

      this.cancelSetting = dialogRef.componentInstance.cancelSetting;
      if (f.dirty && !this.cancelSetting) {
        if (f.valid) {
          console.log('Form OK, now compose an email to RDL requesting change');
          // iterate through the fields and detect which have changed...
          let changeArray = [];
          for (let key in this.restaurant) {
            if (this.restaurant[key] !== this.originalrestaurant[key]) {
              changeArray.push({ key: key.replace('restaurant_', ''),
                was: this.originalrestaurant[key], now: this.restaurant[key] });
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
            this.restaurant[key] = this.originalrestaurant[key];
          }
        } else {
          console.log('Form invalid, return message');
          // now need to revert the data since this was ONLY A REQUEST
          for (let key in this.restaurant) {
            this.restaurant[key] = this.originalrestaurant[key];
          }
        }
      } else {
        console.log('As you were, nothing changed');
        // now need to revert the data since this was ONLY A REQUEST
        for (let key in this.restaurant) {
          this.restaurant[key] = this.originalrestaurant[key];
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


