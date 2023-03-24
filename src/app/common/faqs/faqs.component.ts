import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Faqs } from "../../_models/faqs";
import { ErrorService, MemberService } from "../../_services";

@Component({
  selector: 'app-rc-faqs',
  templateUrl: './faqs.component.html'
})

export class FaqsComponent implements OnInit {

  faqs: Faqs[] = [];
  display_faqs: Faqs[] = [];
  search_text: string;

  constructor(
    private memberService: MemberService,
    private error: ErrorService,
    public dialogRef: MatDialogRef<FaqsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {  }

  ngOnInit() {
    console.log('DATA', this.data);
    // get the faq data from the backend
    this.GetFaqDATA();
    console.log('FAQs', this.faqs);
  }

  GetFaqDATA(): void {
    this.memberService.getFAQs(localStorage.getItem('rd_language'))
      .subscribe({
        next: obj => {
          this.faqs = obj['faqs'];
          this.display_faqs = this.faqs
        },
        error: error => {
          console.log(error);
          this.error.handleError('', 'Failed to get faqs in faqs component! ' + error);
        }
      });
  }

  doSearch() {
    const self= this;
    // filter the faq array based on search text in questions
    this.display_faqs = this.faqs.filter(function (faq)
      {
        return faq.faq_question.toUpperCase().includes(self.search_text.toUpperCase())
      }
    );
  }
}
