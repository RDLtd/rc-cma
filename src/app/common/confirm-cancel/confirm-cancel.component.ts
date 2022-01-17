import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-rc-confirm-cancel',
  templateUrl: './confirm-cancel.component.html'
})
export class ConfirmCancelComponent implements OnInit  {

  constructor(
      public confirmCancelDialog: MatDialogRef<ConfirmCancelComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    // console.log('DATA', this.data);
  }

}
