import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'rc-map-detail',
  templateUrl: 'map-detail.component.html',
  styleUrls: ['map-detail.component.scss']
})

export class MapDetailComponent implements OnInit {

  // google: any;
  maplat: number;
  maplng: number;
  zoom: number;
  restaurant: any;

  constructor(public dialogRef: MatDialogRef<MapDetailComponent>) {

  }

  ngOnInit() {
    this.maplat = Number(this.restaurant.restaurant_lat);
    this.maplng = Number(this.restaurant.restaurant_lng);
    this.zoom = 15;
    // console.log(this.maplat);
  }

}
