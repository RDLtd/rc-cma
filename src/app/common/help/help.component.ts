import { Component, OnInit, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

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
