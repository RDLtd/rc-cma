import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-rc-help',
  templateUrl: './help.component.html'
})

export class HelpComponent implements OnInit {

  transParams: any;

  constructor(
    public dialogRef: MatDialogRef<HelpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {  }

  ngOnInit() {
    console.log('DATA', this.data);
    this.transParams = this.data.transParams;
  }

}
