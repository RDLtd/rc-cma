import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { CMSService, RestaurantService, HelpService } from '../_services';
import { Restaurant, CMSDescription } from '../_models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-cms-reservations',
  templateUrl: './cms-reservations.component.html'
})
export class CmsReservationsComponent implements OnInit {

  @ViewChild('provider_id', {static: true}) private provider_id_input: ElementRef;

  // translation variables
  t_data: any;

  // data objs
  restaurant: Restaurant;
  descriptions: CMSDescription = new CMSDescription();
  dataChanged = false;

  resGeneralMaxLength: Number = 500;
  resGroupMaxLength: Number = 500;
  resPrivateMaxLength: Number = 500;

  booking_providers: any;
  selected_booking_provider;
  selected_booking_provider_index = 0;
  // Todo: need a standard id to test for 'no online bookings'
  selected_booking_provider_id = null;

  // defaults
  booking_provider_reference = '';
  booking_provider_rid_label = '';

  constructor(
    private cms: CMSService,
    private cmsLocalService: CmsLocalService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    public help: HelpService
  ) {
      // detect language changes... need to check for change in texts
      translate.onLangChange.subscribe(lang => {
        this.translate.get('CMS-Reservations').subscribe(data => {this.t_data = data; });
    });
  }

  ngOnInit() {

    this.translate.get('CMS-Reservations').subscribe(data => {
      this.t_data = data;
    });
    // Subscribe to service
    this.cmsLocalService.getRestaurant()
      .subscribe(data => {
          if (data.restaurant_id) {
            this.restaurant = data;
            // console.log(this.restaurant);
            this.getCmsData();
          }
        },
        error => {
        console.log(error);
        });
    this.dataChanged = false;
  }

  getCmsData() {
    this.cms.getDescriptions(this.restaurant.restaurant_id)
      .subscribe(
        data => {
          this.descriptions = data['descriptions'][0];
          // update 041118 - fudge to fix back end returning (or something returning) 'undefined'
          if (this.descriptions.cms_description_reservation_info === 'undefined' ||
            this.descriptions.cms_description_reservation_info === 'null') {
            this.descriptions.cms_description_reservation_info = '';
          }
          if (this.descriptions.cms_description_group === 'undefined' ||
            this.descriptions.cms_description_group === 'null') {
            this.descriptions.cms_description_group = '';
          }
          if (this.descriptions.cms_description_private === 'undefined' ||
            this.descriptions.cms_description_private === 'null') {
            this.descriptions.cms_description_private = '';
          }
          if (this.descriptions.cms_description_booking_rest_id === 'undefined' ||
            this.descriptions.cms_description_booking_rest_id === 'null') {
            this.descriptions.cms_description_booking_rest_id = '';
          } else {
            this.booking_provider_reference = this.descriptions.cms_description_booking_rest_id;
          }
          // console.log(this.descriptions);
          this.dataChanged = false;

          // load booking providers and set the selected one... default is email, which is 0
          this.restaurantService.getBookingProviders(this.restaurant.restaurant_number).subscribe(
            data_providers => {
              if (data_providers['count'] > 0) {
                console.log('BPs', data_providers['booking_providers']);
                this.booking_providers = data_providers['booking_providers'];
                let selectedProvider = this.descriptions.cms_description_booking_provider;
                if (selectedProvider) {
                  for (let i = 0; i < this.booking_providers.length; i++) {
                    if (selectedProvider === this.booking_providers[i].booking_provider_service) {
                      this.selected_booking_provider_index = i;
                    }
                  }
                }
                this.selected_booking_provider = this.booking_providers[this.selected_booking_provider_index];
                this.booking_provider_rid_label = this.selected_booking_provider.booking_provider_rid_label;
              } else {
                console.log('No Booking providers found');
              }
            },
            error => {
              console.log(JSON.stringify(error));
            });
        },
        error => {
          console.log(error);
        });
  }

  changeOption(elem) {
    this.selected_booking_provider_id = this.booking_providers[this.selected_booking_provider_index].booking_provider_id
    this.selected_booking_provider = this.booking_providers[this.selected_booking_provider_index];
    this.booking_provider_rid_label = this.selected_booking_provider.booking_provider_rid_label;
    this.booking_provider_reference = this.selected_booking_provider.booking_provider_reference;
    this.setChanged(elem);
  }

  updateConfigForm(frm) {
    // console.log('Bkg Provider', frm);
    this.updateData();
    setTimeout( () => this.provider_id_input.nativeElement.focus(), 0);
  }

  testBkgLink() {
    // console.log(this.selected_booking_provider_index, this.booking_provider_reference);
    if (this.booking_providers[this.selected_booking_provider_index].booking_provider_url) {
      window.open(this.booking_providers[this.selected_booking_provider_index].booking_provider_url +
        this.booking_provider_reference);
    } else {
      this.cmsLocalService.dspSnackbar(`${this.t_data.NoTest}`, null, 3);
    }
  }

  setChanged(elem): void {
    if (!this.dataChanged) {
      this.dataChanged = true;
     //console.log('Change', elem);
    }
  }

  updateData(): void {

    // Check for required fields
    if (this.selected_booking_provider_id > 1 && this.selected_booking_provider_id !== 5) {
      if (!this.booking_provider_reference) {
        this.cmsLocalService.dspSnackbar(`${this.t_data.PleaseEnter} ${this.selected_booking_provider.booking_provider_rid_label}`,
          null, 3);
        return;
      }
    }

    // call API
    this.descriptions.cms_description_booking_provider = this.selected_booking_provider.booking_provider_service;
    this.descriptions.cms_description_booking_rest_id = this.booking_provider_reference;

    // console.log(this.descriptions.cms_booking_max_covers,
    //   this.descriptions.cms_booking_max_advance_days,
    //   this.descriptions.cms_description_booking_provider,
    //   this.descriptions.cms_description_booking_rest_id
    //   );
    this.cms.updateDescription(this.descriptions).subscribe(
      data => {
        // console.log('RES', data);
        this.dataChanged = false;
        this.cmsLocalService.dspSnackbar(`${this.restaurant.restaurant_name} ${this.t_data.ResInfoUpdate}`, null, 5);
      },
      error => {
        console.log('Error', error);
        this.cmsLocalService.dspSnackbar(this.t_data.UpdateFailed, null, 3);
      });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'booking').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for booking', error);
      });
  }

  // Deactivation guard
  public confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }

  resetData(): void {
    // Reload from db
    this.getCmsData();
  }
}
