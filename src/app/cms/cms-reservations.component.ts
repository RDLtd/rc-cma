import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { CMSService, RestaurantService } from '../_services';
import { Restaurant, CMSDescription } from '../_models';
import { TranslateService } from '@ngx-translate/core';
import { HelpService} from '../common';

@Component({
  selector: 'app-rc-cms-reservations',
  templateUrl: './cms-reservations.component.html'
})
export class CmsReservationsComponent implements OnInit {

  @ViewChild('provider_id') private provider_id_input: ElementRef;

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
  selected_booking_provider_id = null;
  selectedBookingService = 'none';

  // defaults
  booking_provider_reference = '';
  booking_provider_rid_label = '';

  constructor(
    private cms: CMSService,
    private cmsLocalService: CmsLocalService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    public help: HelpService
  ) {  }

  ngOnInit() {
    // Subscribe to service
    this.cmsLocalService.getRestaurant()
      .subscribe({
        next: data => {
          if (data.restaurant_id) {
            this.restaurant = data;
            this.getCmsData();
          }
        },
        error: error => {
          console.log(error);
        }
      });
    this.dataChanged = false;
  }

  cleanStr(obj, str): void {
    if (obj[str] === 'undefined' || obj[str] === 'null') {
      obj[str] = '';
    }
  }

  getCmsData() {
    this.cms.getDescriptions(this.restaurant.restaurant_id)
      .subscribe({
        next: data => {
          this.descriptions = data['descriptions'][0];
          // To hide any crap legacy data
          this.cleanStr(this.descriptions, 'cms_description_reservation_info');
          this.cleanStr(this.descriptions, 'cms_description_group');
          this.cleanStr(this.descriptions, 'cms_description_private');
          this.cleanStr(this.descriptions, 'cms_description_booking_rest_id');
          if (this.descriptions.cms_description_booking_rest_id !== '') {
            this.booking_provider_reference = this.descriptions.cms_description_booking_rest_id;
          }
          this.dataChanged = false;

          // load booking providers and set the selected one... default is email, which is 0
          this.restaurantService.getBookingProviders(this.restaurant.restaurant_number).subscribe({
            next: data_providers => {
              if (data_providers['count'] < 1) {
                console.log('No Booking providers found');
                return;
              }

              this.booking_providers = data_providers['booking_providers'];
              const selectedProvider = this.descriptions.cms_description_booking_provider;
              if (!!selectedProvider) {
                for (let i = 0; i < this.booking_providers.length; i++) {
                  if (selectedProvider === this.booking_providers[i].booking_provider_service) {
                    console.log('SP2', selectedProvider);
                    this.selectedBookingService = selectedProvider;
                    this.selected_booking_provider_index = i;
                    console.log(i);
                    break;
                  }
                  console.log(i);
                }
              }
              console.log('return here');
              this.selected_booking_provider = this.booking_providers[this.selected_booking_provider_index];
              this.booking_provider_rid_label = this.selected_booking_provider.booking_provider_rid_label;

            },
            error: error => {
              console.log(JSON.stringify(error))
            }
          });
        },
        error: error => {
          console.log(error);
        }
      });
  }

  changeOption(elem) {

    this.selected_booking_provider_id = this.booking_providers[this.selected_booking_provider_index].booking_provider_id;
    this.selected_booking_provider = this.booking_providers[this.selected_booking_provider_index];
    this.booking_provider_rid_label = this.selected_booking_provider.booking_provider_rid_label;
    this.booking_provider_reference = this.selected_booking_provider.booking_provider_reference;
    this.selectedBookingService = this.selected_booking_provider.booking_provider_service;
    this.setChanged(elem);
  }

  // updateConfigForm(frm) {
  //   // console.log('Bkg Provider', frm);
  //   this.updateData();
  //   setTimeout( () => this.provider_id_input.nativeElement.focus(), 0);
  // }

  testBkgLink() {
    // console.log(this.selected_booking_provider_index, this.booking_provider_reference);
    if (this.booking_providers[this.selected_booking_provider_index].booking_provider_url) {
      window.open(this.booking_providers[this.selected_booking_provider_index].booking_provider_url +
        this.booking_provider_reference);
    } else {
      this.cmsLocalService.dspSnackbar(this.translate.instant('CMS.RESERVATIONS.msgNoTest'), null, 3);
    }
  }

  setChanged(elem): void {
    if (!this.dataChanged) {
      this.dataChanged = true;
      console.log('Change', elem);
    }
  }

  updateData(): void {

    // Check for required fields
    if (this.selected_booking_provider_id > 1 && this.selected_booking_provider_id !== 5) {
      if (!this.booking_provider_reference) {
        this.cmsLocalService.dspSnackbar(
          this.translate.instant(
            'CMS.RESERVATIONS.msgEnterProvider',
            { id: this.selected_booking_provider.booking_provider_rid_label }),
            null, 3);
        return;
      }
    }

    // call API
    this.descriptions.cms_description_booking_provider = this.selected_booking_provider.booking_provider_service;
    this.descriptions.cms_description_booking_rest_id = this.booking_provider_reference;
    this.cms.updateDescription(this.descriptions).subscribe({
      next: () => {
        this.dataChanged = false;
        this.cmsLocalService.dspSnackbar(
          this.translate.instant(
            'CMS.RESERVATIONS.msgResInfoUpdated',
            { name: this.restaurant.restaurant_name }),
            null, 5);
      },
      error: error => {
        console.log('Error', error);
        this.cmsLocalService.dspSnackbar(this.translate.instant(
          'CMS.RESERVATIONS.msgUpdateFailed'),
          null, 3)
      }
    });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'booking')
      .subscribe({
        next: () => {},
        error: () => {
          console.log('error in updatelastupdatedfield for booking')
        }
      });
  }

  // USED by Deactivation guard
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
