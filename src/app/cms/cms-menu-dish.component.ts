import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-rc-cms-menu-dish',
  templateUrl: './cms-menu-dish.component.html'
})
export class CmsMenuDishComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CmsMenuDishComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any ) { }

  ngOnInit() {
    // console.log(this.data);
  }
}
