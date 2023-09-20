import { Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { HelpService } from '../common';
import { AnalyticsService, CMSService } from "../_services";
import { FormBuilder, FormGroup } from '@angular/forms';
import { Restaurant } from '../_models';
import { StorageService } from '../_services/storage.service';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { CmsSpwBuilderComponent} from "./cms-spw-builder.component";
import { CmsSpwLinksComponent } from './cms-spw-links.component';
import { TranslateService } from "@ngx-translate/core";
import { ConfigService } from '../init/config.service';

export interface TemplateOptions {
  showBookingWidget: { disabled: boolean; on: boolean };
  showContacts: { disabled: boolean; on: boolean };
  showDownloadMenus: { disabled: boolean; on: boolean };
  showGroupBookings: { disabled: boolean; on: boolean };
  showHtmlMenu: { disabled: boolean; on: boolean };
  showImageGallery: { disabled: boolean; on: boolean };
  showLinks: { disabled: boolean; on: boolean };
  showMap: { disabled: boolean; on: boolean };
  showOpeningNotes: { disabled: boolean; on: boolean };
  showParking: { disabled: boolean; on: boolean };
  showPrivateDining: { disabled: boolean; on: boolean };
  showReservations: { disabled: boolean; on: boolean };
  showReservationsInfo: { disabled: boolean; on: boolean };
  showTransport: { disabled: boolean; on: boolean };
}

@Component({
  selector: 'rc-cms-spw-config',
  templateUrl: './cms-spw-config.component.html',
  styles: [
  ]
})
export class CmsSpwConfigComponent implements OnInit {

  brand$: any;
  restaurant: Restaurant;
  user: any; // a.k.a member
  prodCategory: string;
  availableTemplates: any;
  selectedTemplate: any;

  cssThemeObjects: any[];
  selectedTheme: any;

  websiteConfig: TemplateOptions;
  configFormGroup: FormGroup;
  dataChanged = false;

  publishStatus: string;
  publishDate: string;
  publishedBy: string;
  publishedUrl: string;
  unPublishedChanges = false;
  builder: MatDialogRef<CmsSpwBuilderComponent>;
  building = false;
  buildVersion: string;
  buildAvailable = true;
  buildCount = 0;
  apptiserUrl: string;
  apptiserPreviewUrl: string;

  customDomainForm: string;
  hideControls = {
    network: ['domain', 'themes'],
    standard: ['domain'],
    premium: ['']
  }

  defaultTemplateConfig: TemplateOptions = {
    // About
    showOpeningNotes: { disabled: true, on: false },
    showImageGallery: { disabled: false, on: true },
    // Menus
    showHtmlMenu: { disabled: false, on: false },
    showDownloadMenus: { disabled: false, on: false },
    // Reservations
    showReservations: { disabled: false, on: false },
    showReservationsInfo: { disabled: false, on: true },
    showBookingWidget: { disabled: false, on: false },
    showGroupBookings: { disabled: false, on: false },
    showPrivateDining: { disabled: false, on: false },

    // Contacts
    showContacts: { disabled: false, on: true },
    showLinks: { disabled: false, on: true },
    showTransport: { disabled: false, on: true },
    showParking: { disabled: false, on: true },
    // Location
    showMap: { disabled: false, on: true }
  }


  constructor(
    private cmsLocalService: CmsLocalService,
    private fb: FormBuilder,
    public help: HelpService,
    private cms: CMSService,
    private _formBuilder: FormBuilder,
    //private config: AppConfig,
    private storage: StorageService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private ga: AnalyticsService,
    private config: ConfigService
  ) {
      this.user = this.storage.get('rd_profile');
      this.customDomainForm = this.translate.instant('CMS.SETTINGS.linkCustomDomain');
  }

  // For authGuard
  confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation({
        body: this.translate.instant('CMS.SETTINGS.builder.infoDiscardChanges'),
      });
    } else {
      return true;
    }
  }

  ngOnInit() {

    // Subscribe to Brand config
    this.brand$ = this.config.brand;
    this.brand$.subscribe( (obj) => this.availableTemplates = obj.templates );

    // Set category
    this.prodCategory = this.storage.getSession('rd_product_category') ?? 'default';
    // Build website config form

    // Build the config options
    this.generateConfigForm();

    // Load available themes from db
    this.getThemes();

    // Now load the restaurant
    this.loadRestaurantData().then();
  }

  async loadRestaurantData() {
    // Current restaurant data
    this.cmsLocalService.getRestaurant()
      .subscribe({
        next: data => {
          // Make sure the data is available
          if (data.restaurant_id) {
            this.restaurant = data;
            this.publishDate = this.restaurant.restaurant_spw_written;
            this.publishedBy = this.restaurant.restaurant_verified_by;
            this.apptiserUrl = this.cms.getApptiserUrl(this.restaurant.restaurant_spw_url, true);
            this.getConfig();
            this.getContentStatus();
            this.setTemplates();
          }
        },
        error: error => console.log(error)
      });
  }

  /**
   * Set current/selected template
   */
  setTemplates(): void {

    // Already has a published apptiser/spw
    if (!!this.restaurant.restaurant_spw_template) {

      const publishedTemplate = this.restaurant.restaurant_spw_template;

      // Does it match any currently available templates?
      for (const t of this.availableTemplates) {
        // console.log(`Compare ${publishedTemplate} to ${t.version}`)
        // If there's a match, assign it
        if (t.version === publishedTemplate) {
          console.log(`Matched template: ${t.name}`)
          this.selectedTemplate = t;
          return;
        }
      }
      console.log("No match for currently published template");
    }

    // No matching published template so
    // now check Product Category, with fallback
    const cat = this.prodCategory ?? 'default';

    for (const t of this.availableTemplates) {
      console.log(`Looking for matching product category: ${cat}`);
      if (t.name.toLowerCase() === cat) {
        console.log(`Product category match ${t.name.toLowerCase()} (${t.version})`);
        this.selectedTemplate = t;
        return;
      }
    }
  }

  setTemplate(): void {
    // Enable/disable web config controls
    console.log('Compare',this.selectedTemplate.website_defaults, this.defaultTemplateConfig);
    if (!!this.selectedTemplate.website_defaults) {
      console.log('update');
      //this.configFormGroup = this.fb.group(this.selectedTemplate.website_defaults);
      this.setConfig(this.selectedTemplate.website_defaults)
    } else {
      this.setConfig(this.defaultTemplateConfig);
      //this.configFormGroup = this.fb.group(this.defaultTemplateConfig);
    }
    this.configChange(`template`);
    console.log(`Template: ${this.selectedTemplate.version} selected`);
  }

  /**
   * Hides UI elements based on product categories
   * @param uiElement string id of ui element
   *
   */
  hidden(uiElement: string): boolean {
    if (!!this.hideControls[this.prodCategory] && this.hideControls[this.prodCategory].includes(uiElement)) {
      return true;
    }
  }

  getContentStatus(): void {
      this.cms.checkSPW(this.restaurant.restaurant_id)
        .subscribe({
          next: res => {
            console.log(`Check:`, res);
            this.unPublishedChanges = !res['published_status_ok'];
          },
          error: error => {
            console.log('ERROR', error);
          }
        });

  }

  generateConfigForm(): void {

    this.configFormGroup = this.fb.group(this.defaultTemplateConfig);
    console.log('Default Template:', this.defaultTemplateConfig);
    // delay observing changes until defaults are in place
    setTimeout(() => {
      this.configFormGroup.valueChanges.subscribe(() => {
        this.configChange('config');
      });
    }, 1000);

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
          //this.websiteConfig = data['website_config'].website_config_options;
          this.websiteConfig = this.defaultTemplateConfig;
          console.log('Current config', this.websiteConfig);
          this.setConfig();
        },
        error: error => {
          console.log('getWebConfig', error);
        }
      });
  }

  setConfig(templateOptions: TemplateOptions = this.websiteConfig): void {

    console.log('setConfig', templateOptions);

    Object.entries(templateOptions).forEach(([key, value]) => {
      console.log(`${key}: { disabled: ${value['disabled']}, on: ${value['on']} }`);
      //console.log(value);
      let formControl = this.configFormGroup.get(key);
      let on = value['on'];
      let isDisabled = value['disabled']

      if (key === 'theme') {
        this.selectedTheme = value;
        console.log('loaded theme', value);
        return;
      }
      // console.log(formControl, on);
      if(formControl === null) { return; }

      formControl.setValue(on);
      isDisabled ? formControl.disable() : formControl.enable();

      // Disable all reservations content?
      // if (!this.configFormGroup.get('showReservations').value['on']){
      //   this.configFormGroup.get('showReservationsInfo').disable();
      //   this.configFormGroup.get('showBookingWidget').disable();
      //   this.configFormGroup.get('showGroupBookings').disable();
      //   this.configFormGroup.get('showPrivateDining').disable();
      // }
      // // Disable all contacts content?
      // if (!this.configFormGroup.get('showContacts').value['on']){
      //   this.configFormGroup.get('showLinks').disable();
      //   this.configFormGroup.get('showTransport').disable();
      //   this.configFormGroup.get('showParking').disable();
      // }
    });
  }

  configChange(item): void {
    // if it's already been marked, abort
    if(this.unPublishedChanges) {
      return;
    }
    console.log(`Changed: ${item}`);
    this.dataChanged = true;
    this.publishStatus = ': unpublished changes'
    this.unPublishedChanges = true;
  }

  submitFormValues(formGroup: FormGroup): void {
    console.log(formGroup.value);
  }

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

    // apptiser update ks 090323 - added member type (for apptiser).
    // Note that association check is done at the back end, which check for ANY member having this restaurant associated

    // Add theme to form value
    const newConfigObj = this.configFormGroup.value;
    newConfigObj.theme = this.selectedTheme;

    console.log('Updated config', newConfigObj);

    console.log(`Production: ${production}`);

    this.cms.publish(this.restaurant.restaurant_id, this.user.member_id, production, 'standard', newConfigObj, this.selectedTemplate.version)
      .then(res => {

        if (res['status'] !== 'OK') {
          console.log('Publish failed', res);
          return;
        }

        console.log('Publish result', res);


        this.cmsLocalService.loadRestaurant();
        this.onBuildSuccess(res, production);




        // record event
        this.ga.sendEvent('CMS-WebConfig', 'Apptiser', 'Published');

        // reset data changed attribute
        this.cms.resetLastUpdatedField(Number(this.restaurant.restaurant_id))
          .subscribe({
            next: () => {
            },
            error: error => console.log('unable to reset data changed attribute', error)
          });

      })
      .catch((res) => console.log('Publish Endpoint Error', res));
  }

  launchBuilder(version): void {

    console.log(this.buildCount += 1);

    this.building = true;
    this.buildAvailable = false;
    this.builder = this.dialog.open(CmsSpwBuilderComponent, {
      data: {
        buildVersion: version,
        buildReady: false,
        self: this.builder,
        apptiserPreviewUrl: ''
      },
      disableClose: true,
      panelClass: 'rdl-build-container'
    });

    this.builder.afterClosed().subscribe(ready => {

      console.log(`${version} ready = ${ready}`);

      if (!ready) {
        // not built yet so try again
        if (this.buildCount < 3) {
          this.launchBuilder(version);
          return;
        }
        console.error('Unable to build apptiser!');
        return;
      }

      if (version === 'Preview') {
        this.publishStatus = ': unpublished updates';
        return;
      } else {
        this.publishStatus = ': all updates published';
        this.buildAvailable = ready;
      }
      this.building = false;
      this.buildCount = 0;
      return;
    });
  }

  onBuildSuccess(res, production: boolean): void {

    this.cms.getApptiserUrl(this.restaurant.restaurant_spw_url, true);

    if (production) {

      const user = `${this.user.member_first_name} ${this.user.member_last_name}`;
      console.log(user);
      this.unPublishedChanges = false;

      this.cms.verify(this.restaurant.restaurant_id, user)
        .subscribe({
          next: () => {
            this.publishDate = res.published;
            this.publishedBy = user;
            this.publishedUrl = this.cms.getApptiserUrl(res.url, true);
            this.dataChanged = false;
          },
          error: error => console.log(error)
        });

    } else {

      this.unPublishedChanges = true;
      this.apptiserPreviewUrl = this.cms.getApptiserUrl(res.url);
      this.builder.componentInstance.data.apptiserPreviewUrl = this.apptiserPreviewUrl;
      this.dataChanged = true;

    }
    this.building = false;
    this.builder.componentInstance.data.buildReady = true;
  }

  showMarketingLinks(): void {
    this.dialog.open(CmsSpwLinksComponent,
      {
        data: {
          spwUrl: this.apptiserUrl,
          spwMenus: `${this.apptiserUrl}#menus`,
          restaurant: this.restaurant,
          curation: this.brand$.email.curation
        }
      });
  }

  viewApptiser(): void {
    // JB: temp fix to remove html file name
    // as it always returns as 'preview'
    const arr = this.apptiserUrl.split('/');
    arr.pop();
    const tgtUrl = arr.join('/');
    console.log(tgtUrl);
    window.open(`${tgtUrl}/?cache=${Date.now().toString()}`, '_blank');
  }

}
