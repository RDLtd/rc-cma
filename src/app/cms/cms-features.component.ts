import { Component, OnInit } from '@angular/core';
import { CMSService } from '../_services';
import { CmsLocalService } from './cms-local.service';
import { Restaurant, CMSDescription } from '../_models';
import { ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { TranslateService } from '@ngx-translate/core';
import { LoadService, HelpService } from '../common';

@Component({
  selector: 'rc-cms-features',
  templateUrl: './cms-features.component.html'
})

export class CmsFeaturesComponent implements OnInit {

  restaurant: Restaurant;
  features: Array<any> = [];
  descriptions: CMSDescription = new CMSDescription();

  keywords: Array<any> = [];
  dataChanged = false;
  descStraplineTotal = 50;
  descSentenceTotal = 100;
  descParagraphTotal = 200;
  descFullTotal = 5000;
  separatorKeysCodes = [ENTER, 188];
  removable: boolean = true;

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private translate: TranslateService,
    public help: HelpService,
    private loader: LoadService
  ) { }

  ngOnInit() {

    this.loader.open();
    // Subscribe to service
    this.cmsLocalService.getRestaurant()
      .subscribe(data => {
          if (data.restaurant_id) {
            // console.log('GetFeatures', data);
            this.restaurant = data;
            this.getFeatures();
            this.getDesc();
          }
        },
        error => console.log(error));

  }

  confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }

  getFeatures(): void {
    // console.log(this.restaurant.restaurant_id, this.restaurant.restaurant_number.substr(0, 2));
    this.cms.getAttributes(this.restaurant.restaurant_id, this.restaurant.restaurant_number.substr(0, 2))
      .subscribe(data => {
        this.features = data['attributes'];
        // need to check for null before checking length
        if (data['additional']) {
          if (data['additional'].length) {
            this.keywords = data['additional'].split(',');
          }
        }
        this.loader.close();
      },
      error => {
        console.log(JSON.stringify(error));
      });
  }

  getDesc(): void {
    this.cms.getDescriptions(this.restaurant.restaurant_id)
      .subscribe(
      data => {
        this.descriptions = data['descriptions'][0];
        // console.log('Descriptions loaded:', this.descriptions);
      },
      error => {
        console.log(JSON.stringify(error));
      });
  }

  setChanged(): void {
    this.dataChanged = true;
  }

  resetData(): void {
    console.log('Reset', this.descriptions);
    this.getFeatures();
    this.getDesc();
    this.dataChanged = false;
  }

  updateData(): void {

    this.cms.updateAttributes(this.restaurant.restaurant_id, this.features, this.keywords.join(','))
      .subscribe(
      () => {
        this.cmsLocalService.dspSnackbar(
          `${this.restaurant.restaurant_name} ${this.translate.instant('CMS-Features.FeaturesUpdated')}`,
          null,
          5);
      },
      error => {
        console.log('Error', error);
      });

    this.cms.updateDescription(this.descriptions).subscribe(
      () => {
        // console.log('Desc updated', data);
        this.cmsLocalService.dspSnackbar(
          `${this.restaurant.restaurant_name} ${this.translate.instant('CMS-Features.DescriptionsUpdated')}`,
          null,
          5);
      },
      error => {
        console.log('Error', error);
      });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'descriptions').subscribe(
      error => {
        console.log('error in updatelastupdatedfield for descriptions', error);
      });

    this.dataChanged = false;
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our keyword
    if ((value || '').trim()) {
      this.keywords.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.setChanged();
  }

  remove(keyword: any): void {
    const index = this.keywords.indexOf(keyword);
    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
    this.setChanged();
  }
}
