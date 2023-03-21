import { Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { HelpService } from '../common';
import { AnalyticsService, CMSService } from "../_services";
import { FormBuilder, FormGroup } from '@angular/forms';
import { Restaurant } from '../_models';
import { AppConfig } from "../app.config";
import { StorageService } from '../_services/storage.service';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {CmsSpwBuilderComponent} from "./cms-spw-builder.component";

@Component({
  selector: 'rc-cms-spw-config',
  templateUrl: './cms-spw-config.component.html',
  styles: [
  ]
})
export class CmsSpwConfigComponent implements OnInit {

  dataChanged = false;
  building = false;

  restaurant: Restaurant;
  member: any;
  brand: any;
  cssThemeObjects: any[];
  selectedTheme: any;
  user: any;

  configFormGroup: FormGroup;

  // apptiser website
  websiteConfig: {};
  publishDate: string;
  publishedUrl: string;

  builder: MatDialogRef<CmsSpwBuilderComponent>;

  isChecked = true;

  constructor(
    private cmsLocalService: CmsLocalService,
    private fb: FormBuilder,
    public help: HelpService,
    private cms: CMSService,
    private _formBuilder: FormBuilder,
    private config: AppConfig,
    private storage: StorageService,
    private dialog: MatDialog,
    private ga: AnalyticsService,
  ) {
      this.brand = config.brand;
      this.user = this.storage.get('rd_profile');
  }

  // Auth guard
  confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }

  ngOnInit() {
    // Build website config form
    this.generateConfigForm();
    // Load available themes from db
    this.getThemes();
    // Current restaurant data
    this.cmsLocalService.getRestaurant()
      .subscribe({
      next: data => {
        this.restaurant = data;
        this.publishDate = this.restaurant.restaurant_spw_written
        console.log(this.restaurant.restaurant_id);
        this.getConfig();
      },
      error: error => console.log(error)
    });
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

  getThemes(): void {
    this.cms.getWebThemes()
      .subscribe({
        next: data => {
          this.cssThemeObjects = data['website_themes'];
          this.createThemeLinks(data['website_themes']);
        },
        error: error => console.log(error)
      });
  }

  // Make all theme stylesheets available to build swatches
  createThemeLinks(themesObjArray): void {
    let link;
    themesObjArray.forEach(
      theme => {
        link = document.createElement('link');
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = `https://assets.apptiser.io/styles/themes/${theme.website_theme_name}.css`;
        document.head.appendChild(link);
      }
    );
  }

  // get the website config data for this restaurant
  getConfig(): void {

    this.cms.getWebConfig(Number(this.restaurant.restaurant_id))
      .subscribe({
        next: data => {
          // map data to local
          this.websiteConfig = data['website_config'].website_config_options;
          console.log('Conf.', this.websiteConfig);
          this.setConfig();
        },
        error: error => {
          console.log('getWebConfig', error);
        }
      });
  }

  setConfig(): void {
    Object.entries(this.websiteConfig).forEach(([key, value]) => {
      if (key === 'theme') {
        this.selectedTheme = value;
        console.log('loaded theme', value);
        return;
      }
      console.log(`${key}: ${value}`);
      this.configFormGroup.get(key).setValue(value);
    })
  }

  submitFormValues(formGroup: FormGroup): void {
    console.log(formGroup.value);
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

  publishWebsite(production: boolean): void {

    const buildVersion = production ? 'Production' : "Preview";

    console.log(`Building ${buildVersion}`);

    this.launchBuilder(buildVersion);

    //if(!production) { return; }


    // apptiser update ks 090323 - added member type (for apptiser).
    // Note that association check is done at the back end, which check for ANY member having this restaurant associated


    // Add theme to form value
    const newConfigObj = this.configFormGroup.value;
    newConfigObj.theme = this.selectedTheme;
    console.log('Updated config', newConfigObj);

    this.cms.publish(this.restaurant.restaurant_id, production, 'standard', newConfigObj)
      .then(res => {

        if (res['status'] !== 'OK') {
          console.log('Publish failed', res);
          return;
        }

        console.log('Website success:', res);

        this.onBuildSuccess(res);




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
        this.ga.sendEvent('CMS-WebConfig', 'Apptiser', 'Published');

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

  // Domains
  customDomain(): void {
    alert('Open Typeform wizard');
  }

  launchBuilder(version): void {
    this.building = true;
    this.builder = this.dialog.open(CmsSpwBuilderComponent, {
      data: {
        buildVersion: version
      },
      panelClass: 'rdl-build-container'
    });
  }

  onBuildSuccess(res): void {
    this.publishDate = res.published;
    this.publishedUrl = res.url.replace('S3.eu-west-2.amazonaws.com/', '').trim();
    this.builder.close();
  }

  getApptiserDomain(url): string {
    if(!url) { return;}
    if (url.indexOf('s3.eu-west-2.amazonaws.com') > 0) {
      return url.replace('s3.eu-west-2.amazonaws.com/', '');
    }
    return url;
  }

}
