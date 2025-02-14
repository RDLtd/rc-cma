import { Component, OnInit, ViewChild } from '@angular/core';
import { CmsLocalService } from '../cms-local.service';
import { CMSService } from '../../_services';
import { CmsFileUploadComponent } from '../cms-file-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { CMSDescription } from '../../_models';
import { TranslateService } from '@ngx-translate/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { ConfirmCancelComponent, HelpService } from '../../common';

@Component({
  selector: 'app-rc-cms-location',
  templateUrl: './cms-location.component.html'
})
export class CmsLocationComponent implements OnInit {

  mapLat: number;
  mapLng: number;
  restaurant: any;
  directions: any;
  directions_copy: any;
  descriptions: CMSDescription = new CMSDescription();
  fileLoaded = false;
  latMarker = null;
  lngMarker = null;
  dataChanged = false;
  transportPublicLength: Number = 500;
  transportPrivateLength: Number = 500;

  // defaults
  mapOptions: google.maps.MapOptions = {
    scrollwheel: false,
    zoom: 15,
    styles: [
      {
        'featureType': 'poi',
        'stylers': [
          { 'saturation': -100 }
        ]
      }
    ]
  };
  markerOptions: google.maps.MarkerOptions  = {
    draggable: true,
    animation: google.maps.Animation.DROP
  };
  markerPosition: google.maps.LatLngLiteral;

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapMarker, { static: false }) marker: MapMarker;

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private dialog: MatDialog,
    private translate: TranslateService,
    public help: HelpService
  ) {}

  ngOnInit() {

    // Subscribe to service
    this.cmsLocalService.getRestaurant()
      .subscribe({
        next: data => {
          if (data.restaurant_id) {
            this.restaurant = data;
            this.mapLat = this.latMarker = Number(data.restaurant_lat);
            this.mapLng = this.lngMarker = Number(data.restaurant_lng);
            this.mapOptions.center = {lat: this.mapLat, lng: this.mapLng};
            this.markerPosition = {lat: this.latMarker, lng: this.lngMarker};
            this.markerOptions.title = this.restaurant.restaurant_name;
            this.markerOptions.position = this.markerPosition;
            this.getDirectionFile();
            this.getCmsData(this.restaurant.restaurant_id);
          }
        },
        error: error => console.log(error)
      });
  }

  updateRestaurantMarker(): void {
    // console.log(this.marker.getPosition().lat());
    this.restaurant.restaurant_lat = this.marker.getPosition().lat();
    this.restaurant.restaurant_lng = this.marker.getPosition().lng();
    this.dataChanged = true;
  }


  getCmsData(restaurant_id) {
    this.cms.getDescriptions(restaurant_id)
      .subscribe({
        next: data => {
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
        error: error => {
          console.log(error);
        }
    });
  }

  // this IS called by deactivation.guard
  public confirmNavigation() {
    if (this.dataChanged) {
      return this.cmsLocalService.confirmNavigation();
    } else {
      return true;
    }
  }

  resetData(): void {
    this.getCmsData(this.restaurant.restaurant_id);
  }

  resetMapData(): void {
    this.markerPosition = { lat: this.latMarker, lng: this.lngMarker };
    this.directions = this.directions_copy;
    this.dataChanged = false;
  }

  updateGeoCoords() {
    // After marker is dragged
    this.latMarker = this.restaurant.restaurant_lat;
    this.lngMarker = this.restaurant.restaurant_lng;

    this.cms.updateCoordinates(this.restaurant.restaurant_id, this.restaurant.restaurant_lat,
      this.restaurant.restaurant_lng)
        .subscribe({
          next: () => {
            this.cmsLocalService.dspSnackbar(this.translate.instant(
                    'CMS.LOCATION.msgNewCoords',
                    {lat: this.restaurant.restaurant_lat, lng: this.restaurant.restaurant_lng}),
                null, 3);
            this.dataChanged = false;
          },
          error: error => {
            console.log(JSON.stringify(error));
            this.cmsLocalService.dspSnackbar(this.translate.instant('CMS.LOCATION.msgUpdateFailed'), null, 3);
            this.resetMapData();
            this.dataChanged = false;
          }
        });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'location')
        .subscribe({
          next: () => {},
          error: error => console.log('error in updatelastupdatedfield for location', error)
        });

  }

  getDirectionFile(): void {
    this.cms.getElementClass(this.restaurant.restaurant_id, 'Directions', 'N')
      .subscribe({
        next: (data: any) => {
          if (data['elements'].length > 0) {
            this.directions = data['elements'][0];
            console.log(this.directions);
            this.fileLoaded = true;
          } else {
            this.fileLoaded = false;
          }
        },
        error: (error: Error) => {
          console.log(JSON.stringify(error));
        }
      });
  }

  viewDirections() {
    window.open(this.directions.cms_element_image_path, '_blank');
  }

  uploadDirections() {

    console.log('D', this.directions);
    const dialogRef = this.dialog.open(CmsFileUploadComponent, {
      data: {
        type: 'direction',
        tgtObject: this.directions,
        restaurant: this.restaurant
      }
    });
    // Reload directions
    dialogRef.afterClosed().subscribe(() => this.getDirectionFile());

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'location')
        .subscribe({
          next: () => {},
          error: (error: Error) => { console.log(error)}
      });

    dialogRef.componentInstance.dialog = dialogRef;
  }

  deleteDirections(): void {
    console.log(this.directions);
    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        title: 'Are you sure?',
        body: '',
        confirm: 'delete'
      }
    });

    dialogRef.afterClosed()
      .subscribe( confirmed => {
        if (confirmed) {
          this.cms.deleteElement(this.directions.cms_element_id)
            .subscribe({
              next: () => {
                this.getDirectionFile();
              },
              error: error => {
                console.log(error);
              }
            });
        }
      });
  }

  updateTransport(): void {
    // call API
    this.cms.updateDescription(this.descriptions).subscribe({
      next: () => {
        this.dataChanged = false;
        this.cmsLocalService.dspSnackbar(this.translate.instant('CMS.LOCATION.msgTransportUpdated'), null, 5);
      },
      error: error => {
        console.log('Error', error);
      }
    });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'location')
        .subscribe({
          next: () => {
          },
          error: () => {
            console.log('error in updatelastupdatedfield for location');
          }
        });
  }

  setChanged(elem) {
    if (!this.dataChanged) {
      this.dataChanged = true;
      console.log('Change', elem.name);
    }
  }
}
