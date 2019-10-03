import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { CMSService, RestaurantService, HelpService } from '../_services';
import { Restaurant, CMSDescription } from '../_models';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'rc-cms-reservations',
  templateUrl: './cms-reservations.component.html'
})
export class CmsReservationsComponent implements OnInit {

  @ViewChild('provider_id') private provider_id_input: ElementRef;

  // translation variables
  t_data: any;

  // data objs
  restaurant: Restaurant;
  descriptions: CMSDescription = new CMSDescription();
  dataChanged: boolean = false;
  resGeneralMaxLength: Number = 500;
  resGroupMaxLength: Number = 500;
  resPrivateMaxLength: Number = 500;
  booking_options: any;

  selected_bkg_provider: any = {
    max_covers: 8,
    max_days: 30,
    id: 0,
    rid: undefined
  };


  bkg_providers: any = [
    { id: 'email', label: 'Email Request Only', rid_prefix: 'Email: ', rid_label: 'Reservations Email Address'},
    { id: 'simpleerb', label: 'SimpleERB Lite', rid_prefix: 'ID: ', rid_label: 'SimpleERB Account No.'},
    { id: 'opentable', label: 'OpenTable Connect', rid_prefix: 'ID: ', rid_label: 'OpenTable Account ID' +
        ' ',  url: 'https://www.opentable.co.uk/restref/client/?rid='},
    { id: 'bookatable', label: 'Bookatable', rid_prefix: 'ID: ', rid_label: 'Bookatable Account ID'}
  ];

  bkg_config: any = {
    max_covers: 8,
    max_days: 30,
  };

  constructor(
    private cms: CMSService,
    private cmsLocalService: CmsLocalService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    public help: HelpService
  ) { }

  ngOnInit() {

    this.translate.get('CMS-Directory').subscribe(data => {
      this.t_data = data;
    });

    // Subscribe to service
    this.cmsLocalService.getRestaurant()
      .subscribe(data => {
          if (data.restaurant_id) {
            this.restaurant = data;
            // console.log(this.restaurant);
            this.getCmsData();
            // Load booking info
            let country_code;
            if (this.restaurant.restaurant_number.substr(0, 2) === 'FR') {
              country_code = 'FR';
            } else {
              country_code = 'EN';
            }
            this.restaurantService.getBookings(country_code, '').subscribe(
              booking_data => {
                if (booking_data.count > 0) {
                  this.booking_options = booking_data.booking_options;
                  console.log(this.booking_options);
                } else {
                  console.log('No booking option records found in database');
                }
              },
              error => {
                console.log(error);
              });
          }
        },
        error => {
        console.log(error);
        });
    this.dataChanged = false;
  }

  updateConfigForm(frm){
    console.log(frm);
    setTimeout(() => this.provider_id_input.nativeElement.focus(), 0);

  }
  testBkgLink() {
    let provider_config = this.bkg_providers[this.selected_bkg_provider.id];
    //console.log(provider_config);
    window.open(provider_config.url + this.selected_bkg_provider.rid)
  }

  // Deactivation guard
  public confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }

  getCmsData() {
    this.cms.getDescriptions(this.restaurant.restaurant_id)
      .subscribe(
        data => {
          this.descriptions = data.descriptions[0];
          // update 041118 - fudge to fix back end returning (or something returning) 'undefined'
          if (this.descriptions.cms_description_reservation_info === 'undefined') {
            this.descriptions.cms_description_reservation_info = '';
          }
          if (this.descriptions.cms_description_group === 'undefined') {
            this.descriptions.cms_description_group = '';
          }
          if (this.descriptions.cms_description_private === 'undefined') {
            this.descriptions.cms_description_private = '';
          }
          if (this.descriptions.cms_description_booking_rest_id === 'undefined') {
            this.descriptions.cms_description_booking_rest_id = '';
          }
          // console.log(this.descriptions);
          this.dataChanged = false;
        },
        error => {
          console.log(error);
        });
  }

  setChanged(elem): void {
    if (!this.dataChanged) {
      this.dataChanged = true;
      console.log('Change', elem.name);
    }
  }

  updateData(): void {


    // call API
    this.cms.updateDescription(this.descriptions).subscribe(
      data => {
        // console.log('RES', data);
        this.dataChanged = false;
        this.cmsLocalService.dpsSnackbar(`${this.restaurant.restaurant_name} ${this.t_data.ResInfoUpdate}`, null, 5);
      },
      error => {
        console.log('Error', error);
        this.cmsLocalService.dpsSnackbar(this.t_data.UpdateFailed, null, 3);
      });
  }

  resetData(): void {
    // Reload from db
    this.getCmsData();
  }
}
