import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'rc-message',
  templateUrl: './message.component.html'
})

export class MessageComponent implements OnInit {

  company_name;
  country;

  constructor(
    public messageDialog: MatDialogRef<MessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {

    let len = this.data.messages.length;
    if (this.country === 'FR') {
      this.country = 'Assistance ' + localStorage.getItem('rd_country');
      for (let i = 0; i < len; i++) {
        this.data.messages[i].message_text = this.data.messages[i].message_text_FR;
      }
    } else {
      this.country = localStorage.getItem('rd_country') + ' Support';
      for (let i = 0; i < len; i++) {
        this.data.messages[i].message_text = this.data.messages[i].message_text_EN;
      }
    }
  }

}
