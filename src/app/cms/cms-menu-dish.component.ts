import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'rc-cms-menu-dish',
  templateUrl: './cms-menu-dish.component.html'
})
export class CmsMenuDishComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CmsMenuDishComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any ) { }

  ngOnInit() {
    //console.log(this.data);
  }
}
