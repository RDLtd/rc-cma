import { Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { HelpService } from '../common';
import { AnalyticsService, CMSService } from "../_services";
import { FormBuilder, FormGroup } from '@angular/forms';
import { Restaurant } from '../_models';
import {AppConfig} from "../app.config";

@Component({
  selector: 'rc-cms-spw-config',
  templateUrl: './cms-spw-config.component.html',
  styles: [
  ]
})
export class CmsSpwConfigComponent implements OnInit {

  dataChanged = false;
  restaurant: Restaurant;
  member: any;
  brand: any;
  cssThemes = [
    'apptiser',
    'collective',
    'carshalton',
    'rdl'
  ];
  selectedTheme = 'apptiser'

  configFormGroup: FormGroup;

  theme_id: number;

  websiteConfig: {};

  isChecked = true;

  constructor(
    private cmsLocalService: CmsLocalService,
    private fb: FormBuilder,
    public help: HelpService,
    private cms: CMSService,
    private _formBuilder: FormBuilder,
    private config: AppConfig,
    private ga: AnalyticsService,
  ) {
      this.brand = config.brand;
  }

  confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }

  ngOnInit() {

    this.loadThemes();
    this.generateConfigForm();
    this.cmsLocalService.getRestaurant()
      .subscribe({
      next: data => {
        this.restaurant = data;
        this.getConfig();
      },
      error: error => console.log(error)
    });
  }

  setConfig(): void {
    Object.entries(this.websiteConfig).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
      this.configFormGroup.get(key).setValue(value);
    })
  }

  generateConfigForm(): void {
    this.configFormGroup = this.fb.group({
      showOpeningNotes: true,
      showImageGallery: [true],
      // menus
      showHtmlMenu: [true],
      showDownloadMenus: [true],
      // reservations
      showReservations: [true],
      showReservationsInfo: [{value: true, disabled: false}],
      showBookingWidget: [{value: true, disabled: false}],
      showGroupBookings: [{value: false, disabled: false}],
      showPrivateDining: [{value: false, disabled: false}],
      // contacts
      showContacts: [true],
      showLinks: [{value: true, disabled: false}],
      showParking: [{value: true, disabled: false}],
      showTransport: [{value: true, disabled: false}],
      // location
      showMap: [true]
    });
  }

  // TODO: JB: I'm sure this would be better done using nested form groups
  //  but I don't have time to investigate
  toggleSection(control): void {
    const disable = !this.configFormGroup.get(control).value;
    let controls: string[];
    if (control === 'showReservations') {
      controls = ['showReservationsInfo', 'showBookingWidget', 'showGroupBookings', 'showPrivateDining'];
      controls.forEach( c => {
        disable ? this.configFormGroup.get(c).disable() : this.configFormGroup.get(c).enable();
      })
    }
    if (control === 'showContacts') {
      controls = ['showLinks', 'showParking', 'showTransport'];
      controls.forEach( c => {
        disable ? this.configFormGroup.get(c).disable() : this.configFormGroup.get(c).enable();
      })
    }
  }

  getConfig(): void {
    // get the website config data for this restaurant
    this.cms.getWebConfig(Number(this.restaurant.restaurant_id))
      .subscribe({
        next: data => {
          // map data to local
          this.theme_id = data['website_config'].website_config_theme_id;
          this.websiteConfig = data['website_config'].website_config_options;
          this.setConfig();
          console.log('Config', this.websiteConfig);
        },
        error: error => {
          console.log('getWebConfig', error);
        }
      });
  }

  publishWebsite(production: boolean): void {
    if (production) {
      console.log('will publish website');
    } else {
      console.log('will preview website');
    }
    // apptiser update ks 090323 - added member type (for apptiser).
    // Note that association check is done at the back end, which check for ANY member having this restaurant associated

    // for testing only!
    const membership_type = 'standard';

    // TODO make sure we have the options loaded... Now we have 'theme': 'aaaaaaaa' in website_options.

    this.cms.publish(this.restaurant.restaurant_id, production, membership_type, this.websiteConfig)
      .then(res => {

        if (res['status'] !== 'OK') {
          console.log('Publish failed', res);
          return;
        }

        console.log('Website success:', res);

        // TODO deal with this lot!

        // this.spwProdUrl = res['url'];
        // this.spwPreviewUrl = this.getSpwUrl();
        // this.cmsChanged = false;
        // this.d_publishDate = moment(new Date(res['published'])).format('LLLL');

        // // this.publishDate = new Date(res['published']);
        //
        // this.verifyData();
        // this.isPreviewing = false;

        // // record event
        // this.ga.sendEvent('CMS-Dashboard', 'Apptiser', 'Published');

        // // reset data changed attribute
        // this.cms.resetLastUpdatedField(Number(restaurant_id))
        //   .subscribe({
        //     next: () => {
        //     },
        //     error: error => {
        //       console.log('unable to reset data changed attribute', error);
        //     }
        //   });

      })
      .catch((res) => console.log('Publish Endpoint Error', res));
  }

  // Web config
  submitFormValues(formGroup: FormGroup): void {
    console.log(formGroup.value);
  }

  // Domains
  customDomain(): void {
    alert('Open Typeform wizard');
  }




  // Themes
  loadThemes(): void {
    let link;
    this.cssThemes.forEach(
      theme => {
        link = document.createElement('link');
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = `https://assets.apptiser.io/styles/themes/${theme}.css`;
        document.head.appendChild(link);
      }
    );

  }
}
