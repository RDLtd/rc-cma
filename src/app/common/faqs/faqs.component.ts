import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Faqs} from "../../_models/faqs";

@Component({
  selector: 'app-rc-faqs',
  templateUrl: './faqs.component.html'
})

export class FaqsComponent implements OnInit {

  faqs: Faqs[] = [];

  constructor(
    public dialogRef: MatDialogRef<FaqsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {  }

  ngOnInit() {
    console.log('DATA', this.data);
    // get the faq data from the backend
    this.GetFaqDATA();
    console.log('FAQs', this.faqs);
  }

  GetFaqDATA(): void {
    // dummy data for now
    this.faqs.push({
      faq_rating: 3,
      faq_question: "Why can't I associate my restaurant?",
      faq_response: "If your problem is in the restaurant search, try searching using some of the other criteria, such as **Post Code**",
      faq_show: false
    });
    this.faqs.push({
      faq_rating: 2,
      faq_question: "I have taken some pictures on my phone - how do I get them on to my website?",
      faq_response: "You will first need to transfer them to a file system, or perhaps even your computer.",
      faq_show: true
    });
    this.faqs.push({
      faq_rating: 1,
      faq_question: "I already have a registered domain, how do I make it show this website?",
      faq_response: "Our support team will help you with that, just fill in a support request and we'll get back to you.",
      faq_show: false
    });
  }

}
