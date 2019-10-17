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
    this.company_name = localStorage.getItem('rd_company_name');
    // decide which version of the message to use
    this.country = localStorage.getItem('rd_country');
    for (let i = 0; i < this.data.messages.length; i++) {
      if (this.country === 'FR') {
        this.data.messages[i].message_text = this.data.messages[i].message_text_FR;
      } else {
        this.data.messages[i].message_text = this.data.messages[i].message_text_EN;
      }
    }
  }

}
