import { Component, OnInit, ViewChild } from '@angular/core';
import { CmsLocalService } from './cms-local.service';
import { CMSService, HelpService } from '../_services';
import { CmsFileUploadComponent } from './cms-file-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { CMSDescription } from '../_models';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GoogleMap, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'rc-cms-location',
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
  allowMarkerDrag = true;
  latMarker = null;
  lngMarker = null;
  dataChanged = false;
  transportPublicLength: Number = 500;
  transportPrivateLength: Number = 500;

  // translation variables
  t_data: any;

  mapsApiLoaded: Observable<boolean>;
  center: any;

  markerLatLng;
  mapWidth: '100%';
  mapHeight: '480px';
  mapOptions: google.maps.MapOptions;
  markerOptions: google.maps.MarkerOptions;
  markerPosition: google.maps.LatLngLiteral;

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapMarker, { static: false }) marker: MapMarker;

  constructor(
    private cmsLocalService: CmsLocalService,
    private cms: CMSService,
    private dialog: MatDialog,
    private translate: TranslateService,
    public help: HelpService,
    private http: HttpClient
  ) {
    this.mapsApiLoaded = http.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyCji4lOA-nPgICQjFO_4rVyuWKW1jP1Lkc', 'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

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
          this.mapOptions = {
            scrollwheel: false,
            center: { lat: this.mapLat, lng: this.mapLng },
            zoom: 16,
            styles: [
              {
                "featureType": "poi",
                "stylers": [
                  { "saturation": -100 }
                ]
              }
            ]
          }
          this.markerOptions = {
            draggable: true,
            title: this.restaurant.restaurant_name,
            animation: google.maps.Animation.DROP
          }
          this.markerPosition = { lat: this.latMarker, lng: this.lngMarker };
          this.getDirectionFile();
          this.getCmsData(this.restaurant.restaurant_id);
        }

        },
        error => console.log(error));
  }

  updateRestaurantMarker(): void {
    //console.log(this.marker.getPosition().lat());
    this.restaurant.restaurant_lat = this.marker.getPosition().lat();
    this.restaurant.restaurant_lng = this.marker.getPosition().lng();
    this.dataChanged = true;
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
      this.restaurant.restaurant_lng).subscribe(
      () => {
        this.cmsLocalService.dspSnackbar(this.t_data.NewGeo + this.restaurant.restaurant_lat + ', ' +
          this.restaurant.restaurant_lng, null, 3);
        this.dataChanged = false;
      },
      error => {
        console.log(JSON.stringify(error));
        this.cmsLocalService.dspSnackbar(this.t_data.UpdateFailed, null, 3);
        this.resetMapData();
        this.dataChanged = false;
      });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'location').subscribe(
      () => {},
      error => {
        console.log('error in updatelastupdatedfield for location', error);
      });

  }

  getDirectionFile(): void {
    this.cms.getElementClass(this.restaurant.restaurant_id, 'Directions', 'N')
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
        type: 'direction',
        tgtObject: this.directions,
        restaurant: this.restaurant
      }
    });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'location').subscribe(
      () => {},
      () => {
        console.log('error in updatelastupdatedfield for location');
      });

    dialogRef.componentInstance.dialog = dialogRef;
  }

  updateTransport(): void {
    // call API
    this.cms.updateDescription(this.descriptions).subscribe(
      () => {
        this.dataChanged = false;
        this.cmsLocalService.dspSnackbar(this.restaurant.restaurant_name + this.t_data.TransportUpdate, null, 5);
      },
      error => {
        console.log('Error', error);
      });

    this.cms.updateLastCreatedField(Number(this.restaurant.restaurant_id), 'location').subscribe(
      () => {},
      () => {
        console.log('error in updatelastupdatedfield for location');
      });
  }

  setChanged(elem) {
    if (!this.dataChanged) {
      this.dataChanged = true;
      // console.log('Change', elem.name);
    }
  }
}
