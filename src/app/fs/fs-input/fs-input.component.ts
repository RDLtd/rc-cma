import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { PageScrollInstance, PageScrollService } from 'ng2-page-scroll';
import { DOCUMENT } from '@angular/common';
import { FsLocalService } from '../fs-local.service';
import { FinancialService } from '../../_services';
//import {NgForm} from '@angular/forms';

@Component({
  selector: 'rc-fs-input',
  templateUrl: './fs-input.component.html'
})
export class FsInputComponent implements OnInit {

  public dataChanged:boolean = false;

  @ViewChild('fsMonths') fsMonths;
  @ViewChild('fsInputForm') fsInputForm;

  selectedYear: string = (new Date().getFullYear() - 1).toString();

  fsYears = [
    { value: '2018', label: '2018' },
    { value: '2017', label: '2017' },
    { value: '2016', label: '2016' },
    { value: '2015', label: '2015' },
    { value: '2014', label: '2014' },
    { value: '2013', label: '2013' },
    { value: '2012', label: '2012' },
    { value: '2011', label: '2011' }
  ];

  fsData: any = {};
  fsRestaurants: any;
  selectedRestaurantId: any;
  fsDataSet: any;

  constructor(
    private fsLocalService: FsLocalService,
    private financialService: FinancialService,
    private pageScrollService: PageScrollService,
    @Inject(DOCUMENT) private document: any
  ) { }

  ngOnInit() {

    this.fsLocalService.getRestaurants()
      .subscribe(data => {
        this.fsRestaurants = data;
        if (this.fsRestaurants.length) {
          this.selectedRestaurantId = this.fsRestaurants[0].restaurant_id;
        }
        this.getFsData(this.selectedRestaurantId);
      },
        error => console.log(error)
      );
  }


  flagChange() {
    console.log('CHANGE');
    this.dataChanged = true;
  }

  getFsData(id) {

    this.financialService.getForRestaurant(id)
      .subscribe(
        data => {
          // console.log(data);
          this.fsDataSet = data.financials;
          this.dspFsData(this.selectedYear);
          this.dataChanged = false;
        },
        error => {
          console.log(error);
        });
  }

  dspFsData(year) {

    // Find the relevant data
    const obj = this.fsDataSet.filter(function(node) {
      return node.financial_year_end === year;
    });

    if (obj.length) {
      this.fsData = obj[0];
    } else {
      // There is no record so create a default one
      this.fsData = {
        financial_admin_costs: '',
        financial_annual_covers: '',
        financial_annual_wage_bill: '',
        financial_gross_profit: '',
        financial_average_spend: '',
        financial_capex: '',
        financial_exceptions: '',
        financial_net_assets: '',
        financial_profit_before_tax: '',
        financial_property_rent: '',
        financial_property_size: '',
        financial_seat_count: '',
        financial_staff_count: '',
        financial_turnover: ''
      };
    }
  }

  updateFsData(fs) {

    // Add mandatory fields
    fs.financial_restaurant_id = this.selectedRestaurantId;
    fs.financial_year_end = this.selectedYear;

    // Is it an existing record?
    if (this.fsData.financial_id) {
      fs.financial_id = this.fsData.financial_id;
      // console.log(fs);
      this.financialService.update(fs)
        .subscribe(
          data => {
            // console.log(data);
            // Reload
            this.getFsData(this.selectedRestaurantId);
          },
          error => {
            console.log('Failed to update financial record');
          });

    } else {

      fs.financial_months = this.fsMonths.value;
      // console.log(fs);
      this.financialService.create(fs)
        .subscribe(
          data => {
            console.log('Added new financial record');
            // Reload
            this.getFsData(this.selectedRestaurantId);
          },
          error => {
            console.log('Failed to add new financial record');
          });
    }

  }

  scrollTo(id): void {
    const pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, id);
    this.pageScrollService.start(pageScrollInstance);
  }

}
