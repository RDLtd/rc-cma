import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'rc-load',
  templateUrl: './load.component.html'
})
export class LoadComponent implements OnInit {

  constructor(
    private translate: TranslateService,
    public confirmCancelDialog: MatDialogRef<LoadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

}
