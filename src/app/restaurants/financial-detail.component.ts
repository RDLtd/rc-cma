import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FinancialService } from '../_services/financial.service';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from 'ng2-translate';
import { Financial } from '../_models/financial';

@Component({
  selector: 'rc-financial-detail',
  templateUrl: './financial-detail.component.html'
})

export class FinancialDetailComponent implements OnInit {

  @ViewChild('financialForm') financialForm: NgForm;
  editMode: Boolean;
  restaurant: any;
  financial: any;
  yearendoptions: any[] = [];
  yearendselection: any;

  constructor(public snackBar: MatSnackBar,
              private translate: TranslateService,
              public financialService: FinancialService) {}

  ngOnInit() {
    // console.log(JSON.stringify(this.financial));
  }

  setYearEnd(code) {
    // console.log(code);
    this.financial['financial_year_end'] = code;
  }

  toggleEditMode($event) {
    console.log(this.restaurant);
    let toggle = $event.target;
    this.editMode = !this.editMode;
    // toggle.checked = this.editMode;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

}
