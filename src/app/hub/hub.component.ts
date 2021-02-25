import { Component, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageComponent } from '../common';

@Component({
  selector: 'rc-hub',
  templateUrl: './hub.component.html'
})
export class HubComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.dspMessages();
  }
  dspMessages() {
    let dialogRef = this.dialog.open(MessageComponent);
  }
}
