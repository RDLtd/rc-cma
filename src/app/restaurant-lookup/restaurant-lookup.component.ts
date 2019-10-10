import { Component, Inject, OnInit } from '@angular/core';
import { Restaurant } from '../_models/restaurant';
import { RestaurantService } from '../_services/restaurant.service';
import { AppConfig } from '../app.config';
import { ProfileVerifyComponent } from '../members/profile-page/profile-verify.component';
import { MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';;
import { HelpService } from '../_services';
import { map } from 'rxjs/operators';

@Component({
  selector: 'rc-restaurant-lookup',
  templateUrl: './restaurant-lookup.component.html'
})

export class RestaurantLookupComponent implements OnInit {
  noSearchResults: boolean = false;
  dspNewListingForm: boolean = false;
  restaurants: Restaurant[] = [];
  sql_parameters: any = this.config.sql_defaults;
  country: string;
  // translation variables
  t_data: any;

  constructor(
    private   restaurantService: RestaurantService,
    private   config: AppConfig,
    public    dialog: MatDialog,
    public    help: HelpService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private   translate: TranslateService,
    private   snackBar: MatSnackBar,
    private   http: HttpClient
  ) { }

  ngOnInit() {
    this.translate.get('Restaurant-Lookup')
      .subscribe(data => this.t_data = data);
    this.GetCountry().subscribe(
      data => {
        // console.log(data);
        // console.log('You are in ' + data.country);
        //
        // expect GB for United Kingdom, FR for France, DE for Germany, ZA for South Africa
        switch (data.country) {
          case 'FR': {
            this.country = 'FR';
            break;
          }
          case 'ZA': {
            this.country = 'UK';
            break;
          }
          default: {
            this.country = 'UK';
          }
        }
      },
      error => {
        console.log(JSON.stringify(error));
      });
  }

  GetCountry () {
    return this.http.get('https://ipinfo.io').pipe(map((res: any) => res.json()));
  }

  findRestaurants(str) {

    // upgrade 10/7/18 to add optional parameter to filter by restaurant_status
    this.sql_parameters = {
      where_field: 'restaurant_name',
      where_string: str,
      where_any_position: 'Y',
      sort_field: 'restaurant_name',
      sort_direction: 'ASC',
      limit_number: 20,
      limit_index: '0',
      restaurant_status: 'Curation Complete',
      country: this.country
    };

    // If user has input something
    if (str) {

      this.restaurantService.getSubset(this.sql_parameters)
        .subscribe(
          data => {
            // console.log({data});
            this.restaurants = data['restaurants'];
            if (this.restaurants.length < 1) {
              this.noSearchResults = true;
            } else {
              this.noSearchResults = false;
              this.dspNewListingForm = false;
            }
          },
          error => {
            console.log(error);
          });
    } else {
      this.restaurants = null;
      this.noSearchResults = false;
    }
  }

  associateRestaurant(item) {

    const count = this.data.associatedRestaurants.length;

    // Make sure it's not already been associated
    for (let i = 0; i < count; i++) {
      if (this.data.associatedRestaurants[i].restaurant_post_code === item.restaurant_post_code ) {
        // console.log('Restaurant already associated');
        this.dspSnackBar(item.restaurant_name + this.t_data.AlreadyAdded);
        return;
      }
    }
    // And also make sure it's not already been verified by owner, in which case there is already an admin user
    if (item.restaurant_data_status === 'Verified By Owner') {
      this.dspSnackBar(item.restaurant_name + this.t_data.AlreadyVerified);
      return;
    }

    // Before setting up an association make sure the user gets an authorisation code
    const dialogref = this.dialog.open(ProfileVerifyComponent, {
      data: {
        rest_name: item.restaurant_name,
        rest_email: item.restaurant_email,
        rest_verification_code: item.restaurant_number
      }
    });

    dialogref.afterClosed().subscribe(result => {

      if (result) {
        // user typed the right code
        if (result.confirmed) {
          this.restaurantService.addAssociation(this.data.member_id, item.restaurant_id).subscribe(
            data => {
              console.log(data);

              this.data.associatedRestaurants.push(item);
              // TODO at this point all is OK with the association so we need to make this restaurant a member
              this.dspSnackBar(item.restaurant_name + this.t_data.Added);
            },
            error => {
              console.log(error);
            });
          this.dialog.closeAll();
        } else {
          console.log('Invalid code');
        }
      }
    });
  }

  showRequestForm(searchInput){
    // reset search field
    searchInput.value = '';
    // reset results list
    this.restaurants = [];
    this.dspNewListingForm = true;
  }

  sendNewRequest(f) {
    console.log(f.newRestaurantName);
    // API call to add listing
    this.dialog.closeAll();
    this.dspSnackBar(this.t_data.RequestSent);
  }

  dspSnackBar(msg: string) {
    this.snackBar.open( msg, null, {
      duration: 3000
    });
  }

}
