import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'rc-message',
  templateUrl: './message.component.html'
})
export class MessageComponent {

  constructor(
    public messageDialog: MatDialogRef<MessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
