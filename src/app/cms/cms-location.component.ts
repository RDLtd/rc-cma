import { Component, OnInit } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { CMSService, HelpService } from '../_services';
import { CmsFileUploadComponent } from './cms-file-upload.component';
import { MatDialog } from '@angular/material';
import { CMSDescription } from '../_models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'rc-cms-location',
  templateUrl: './cms-location.component.html',
  styleUrls: ['cms-location.component.scss']
})
export class CmsLocationComponent implements OnInit {

  mapLat: number;
  mapLng: number;
  zoom: number;
  restaurant: any;
  directions: any;
  directions_copy: any;
  descriptions: CMSDescription = new CMSDescription();
  fileLoaded = false;
  allowMarkerDrag = true;
  latMarker = null;
  lngMarker = null;
  dataChanged = false;
  transportPublicLength: Number = 500;
  transportPrivateLength: Number = 500;

  // translation variables
  t_data: any;

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private dialog: MatDialog,
    private translate: TranslateService,
    public help: HelpService
  ) { }

  ngOnInit() {

    this.translate.get('CMS-Location').subscribe(data => {
      this.t_data = data;
    });

    // Subscribe to service
    this.cmsLocalService.getRestaurant()
      .subscribe(data => {
        if (data.restaurant_id) {

          this.restaurant = data;
          this.mapLat = this.latMarker = Number(data.restaurant_lat);
          this.mapLng = this.lngMarker = Number(data.restaurant_lng);
          // console.log(this.maplat, this.maplng);
          this.zoom = 16;
          this.getDirectionFile();
          this.getCmsData(this.restaurant.restaurant_id);
        }

        },
        error => console.log(error));
  }

  getCmsData(restaurant_id) {
    this.cms.getDescriptions(restaurant_id)
      .subscribe(
        data => {
          this.directions_copy = this.descriptions = data['descriptions'][0];
          // update 041118 - fudge to fix back end returning (or something returning) 'undefined'
          if (this.descriptions.cms_description_car_parking === 'undefined') {
            this.descriptions.cms_description_car_parking = '';
          }
          if (this.descriptions.cms_description_public_transport === 'undefined') {
            this.descriptions.cms_description_public_transport = '';
          }
          this.dataChanged = false;
        },
        error => {
          console.log(error);
        });
  }

  // called by deactivation.guard
  public confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    }else {
      return true;
    }
  }

  resetData(): void {
    this.restaurant.restaurant_lat = this.latMarker;
    this.restaurant.restaurant_lng = this.lngMarker;
    this.directions = this.directions_copy;
    this.dataChanged = false;
  }

  getMarkerPosition(e) {
    this.restaurant.restaurant_lat = e.coords.lat;
    this.restaurant.restaurant_lng = e.coords.lng;
    this.dataChanged = true;
  }

  updateGeoCoords() {
    // After marker is dragged
    this.latMarker = this.restaurant.restaurant_lat;
    this.lngMarker = this.restaurant.restaurant_lng;

    this.cms.updateCoordinates(this.restaurant.restaurant_id, this.restaurant.restaurant_lat,
      this.restaurant.restaurant_lng).subscribe(
      data => {
        // console.log(JSON.stringify(data));
        // console.log('Coordinates updated');
        this.cmsLocalService.dpsSnackbar(this.t_data.NewGeo + this.restaurant.restaurant_lat + ', ' +
          this.restaurant.restaurant_lng, null, 3);
        this.dataChanged = false;
      },
      error => {
        console.log(JSON.stringify(error));
        this.cmsLocalService.dpsSnackbar(this.t_data.UpdateFailed, null, 3);
        this.resetData();
        this.dataChanged = false;
      });

  }

  getDirectionFile(): void {
    this.cms.getElementClass(this.restaurant.restaurant_id, 'Directions', 'Y')
      .subscribe(
      data => {
        if (data['elements'].length > 0) {
          this.directions = data['elements'][0];
          this.fileLoaded = true;
        } else {
          this.fileLoaded = false;
        }
      },
      error => {
        console.log(JSON.stringify(error));
      });
  }

  viewDirections() {
    window.open(this.directions.cms_element_image_path, '_blank');
  }

  uploadDirections() {
    let dialogRef = this.dialog.open(CmsFileUploadComponent, {
      data: {
        type: 'directions file',
        tgtObject: this.directions,
        dialog: this.dialog
      }
    });
  }

  updateTransport(): void {
    // call API
    this.cms.updateDescription(this.descriptions).subscribe(
      res => {
        // console.log('RES', res);
        this.dataChanged = false;
        this.cmsLocalService.dpsSnackbar(this.restaurant.restaurant_name + this.t_data.TransportUpdate, null, 5);
      },
      error => {
        console.log('Error', error);
      });
  }

  setChanged(elem) {
    if (!this.dataChanged) {
      this.dataChanged = true;
      // console.log('Change', elem.name);
    }
  }
}
