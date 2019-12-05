import { Component, Inject, OnInit } from '@angular/core';
import { Restaurant } from '../_models/restaurant';
import { RestaurantService } from '../_services/restaurant.service';
import { AppConfig } from '../app.config';
import { ProfileVerifyComponent } from './profile-verify.component';
import { MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';;
import { HelpService } from '../_services';

@Component({
  selector: 'rc-restaurant-lookup',
  templateUrl: './restaurant-lookup.component.html'
})

export class RestaurantLookupComponent implements OnInit {
  noSearchResults = false;
  dspNewListingForm = false;
  verificationCodeRequired = true;
  contactEmailRequired = false;
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
        // console.log('You are in ' + data['country']);
        // expect GB for United Kingdom, FR for France, DE for Germany, ZA for South Africa
        switch (data['country']) {
          case 'FR': {
            this.country = 'FR';
            break;
          }
          case 'ZA': {
            this.country = 'FR';
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
    // return this.http.get('https://ipinfo.io').pipe(map((res: any) => res.json()));
    return this.http.get('https://ipinfo.io?token=b3a0582a14c7a4');
  }

  findRestaurants(str) {

    // upgrade 10/7/18 to add optional parameter to filter by restaurant_status
    this.sql_parameters = {
      where_field: 'restaurant_name',
      where_string: str,
      where_any_position: 'N',
      sort_field: 'restaurant_name',
      sort_direction: 'ASC',
      limit_number: 20,
      limit_index: '0',
      restaurant_status: 'Curation Complete',
      country: this.country
    };

    // If user has input something
    if (str.trim()) {

      this.restaurantService.getSubset(this.sql_parameters)
        .subscribe(
          data => {
            // console.log({data});
            this.restaurants = data['restaurants'];
            if (!this.restaurants.length) {
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

  associateRestaurant(selected) {

    // TODO so here is the problem, via the join form we don't have this data set
    //console.log(this.data.associatedRestaurants);

    // Make sure it's not already been associated
    // by comparing to current associations
    const totalAssociatedRestaurants = this.data.associatedRestaurants.length;
    for (let i = 0; i < totalAssociatedRestaurants; i++) {
      let associatedRestaurant = this.data.associatedRestaurants[i];
      if (associatedRestaurant.restaurant_name === selected.restaurant_name &&
        associatedRestaurant.restaurant_address_1 === selected.restaurant_address_1) {
        // console.log('Restaurant already associated');
        this.dspSnackBar(
          selected.restaurant_name + this.t_data.AlreadyAdded
        );
        return;
      }
    }

    // Has it already been verified by owner?
    // i.e. is there already an admin user
    if (selected.restaurant_data_status === 'Verified By Owner') {
      this.dspSnackBar(
        selected.restaurant_name + this.t_data.AlreadyVerified
      );
      return;
    }

    // Do we need to check the verification code?
    this.verificationCodeRequired = sessionStorage.getItem('referrer_type') !== 'member';
    // Is there a contact email for the selected restaurant?
    this.contactEmailRequired = !this.isValidEmail(selected.restaurant_email.trim());

    // Verification
    if (this.verificationCodeRequired || this.contactEmailRequired) {
      const dialogref = this.dialog.open(ProfileVerifyComponent, {
        data: {
          restaurant: selected,
          member: this.data.member,
          verificationCodeRequired: this.verificationCodeRequired,
          contactEmailRequired: this.contactEmailRequired
        }
      });

      dialogref.afterClosed().subscribe(association => {
        if (association) {
          if (association.verified) {
            this.addAssociation(selected);
          } else {
            console.log('Invalid code or cancelled operation');
          }
        }
      });
    } else {
      this.addAssociation(selected);
    }
  }

  isValidEmail(emailAddress): boolean {
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/.test(emailAddress);
  }

  addAssociation(newRestaurant) {
    this.restaurantService.addAssociation(this.data.member.member_id, newRestaurant.restaurant_id).subscribe(
      data => {
        //console.log(data);

        // Verify email contact details
        if(!newRestaurant.restaurant_email.trim().length) {
          console.log(`No Email: ${ newRestaurant.restaurant_email}`);
        }

        this.data.associatedRestaurants.push(newRestaurant);
        this.dspSnackBar(newRestaurant.restaurant_name + this.t_data.Added);
        // TODO need to make this restaurant a member - now works
        this.restaurantService.updateMemberStatus(newRestaurant.restaurant_id, 'Associate').subscribe(
          memdata => {
            console.log(memdata);
          },
          error => {
            console.log(error);
          });
      },
      error => {
        console.log(error);
      });
    this.dialog.closeAll();
  }

  showRequestForm(searchInput) {
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
