import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'rc-message',
  templateUrl: './message.component.html'
})

export class MessageComponent implements OnInit {

  company_name;

  constructor(
    public messageDialog: MatDialogRef<MessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    console.log('message data 1: ', this.data);
    this.company_name = localStorage.getItem('rd_company_name');
    // select the correct language...
    if (localStorage.getItem('rd_country') === 'fr') {
      for (let i = 0; i < this.data.messages.length; i++) {
        this.data.messages[i].body = this.data.messages[i].message_text_FR;
        this.data.messages[i].heading = this.data.messages[i].message_subject_FR;
      }
    } else {
      for (let i = 0; i < this.data.messages.length; i++) {
        this.data.messages[i].body = this.data.messages[i].message_text_EN;
        this.data.messages[i].heading = this.data.messages[i].message_subject_EN;
      }
    }
    console.log('message data 2: ', this.data);
  }

}
