import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FinancialService } from '../_services/financial.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';;
import { Financial } from '../_models/financial';
import { FinancialDetailComponent } from './financial-detail.component';
import { BenchmarkComponent } from './benchmark.component';

declare var google: any;

@Component({
  selector: 'rc-financial-view',
  templateUrl: './financial-view.component.html'
})

export class FinancialViewComponent implements OnInit {

  @ViewChild('financialView') financialView: NgForm;
  editMode: Boolean;
  restaurant: any;
  financials: any[] = [];
  financialslength: number;
  t_string: string;

  graphDataOptions: any[] = [];
  graphDataSelection: any;
  public line_ChartHeading: string;
  public line_ChartData = [];
  public line_ChartOptions  = {
    title: '',
    legend: 'none',
    fontName: 'Roboto',
    fontSize: '16',
    chartArea: {
      left: 80,
      right: 24,
      top: 32
    }
  };

  constructor(public snackBar: MatSnackBar,
              private translate: TranslateService,
              public dialog: MatDialog,
              public financialService: FinancialService) {}

  ngOnInit() {
    this.getFinancials(this.restaurant.restaurant_id);
    this.graphDataOptions.push({ value: 'A', label: 'Turnover' });
    this.graphDataOptions.push({ value: 'B', label: 'Gross Profit' });
    this.graphDataOptions.push({ value: 'C', label: 'Administration Costs' });
    this.graphDataOptions.push({ value: 'D', label: 'PBT' });
    this.graphDataOptions.push({ value: 'E', label: 'CAPEX' });
    this.graphDataOptions.push({ value: 'F', label: 'Annual Wage Bill' });
    this.graphDataOptions.push({ value: 'G', label: 'Average Spend' });
  }

  toggleEditMode($event) {
    console.log(this.restaurant);
    const toggle = $event.target;
    this.editMode = !this.editMode;
    // toggle.checked = this.editMode;
  }

  drawGraph(chartData, chartOptions) {
    // google.charts.setOnLoadCallback(drawChart); // don't seem to need this since we have already loaded the instance
    drawChart();
    function drawChart() {
      const wrapper = new google.visualization.ChartWrapper({
        chartType: 'ColumnChart',
        dataTable: chartData,
        options: chartOptions || {},
        containerId: 'line_chart'
      });
      wrapper.draw();
    }
  }

  setGraphData(code) {
    console.log(code);
    let j: number;
    switch (code) {
      case 'A': {
        this.line_ChartHeading = 'Turnover (£ 000s)';
        this.line_ChartData = [['Year', 'Turnover']];
        for (j = 0; j < this.financials.length; j++) {
          this.line_ChartData.push([this.financials[j].financial_year_end,
            Number(this.financials[j].financial_turnover)]);
        }
        break;
      }
      case 'B': {
        this.line_ChartHeading = 'Gross Profit (£ 000s)';
        this.line_ChartData = [['Year', 'GP']];
        for (j = 0; j < this.financials.length; j++) {
          this.line_ChartData.push([this.financials[j].financial_year_end,
            Number(this.financials[j].financial_gross_profit)]);
        }
        break;
      }
      case 'C': {
        this.line_ChartHeading = 'Administration Costs (£ 000s)';
        this.line_ChartData = [['Year', 'Administration Costs']];
        for (j = 0; j < this.financials.length; j++) {
          this.line_ChartData.push([this.financials[j].financial_year_end,
            Number(this.financials[j].financial_admin_costs)]);
        }
        break;
      }
      case 'D': {;
        this.line_ChartHeading = 'Profit Before Tax (£ 000s)'
        this.line_ChartData = [['Year', 'PBT']];
        for (j = 0; j < this.financials.length; j++) {
          this.line_ChartData.push([this.financials[j].financial_year_end,
            Number(this.financials[j].financial_profit_before_tax)]);
        }
        break;
      }
      case 'E': {;
        this.line_ChartHeading = 'Capital Expenditure (£ 000s)'
        this.line_ChartData = [['Year', 'PBT']];
        for (j = 0; j < this.financials.length; j++) {
          this.line_ChartData.push([this.financials[j].financial_year_end,
            Number(this.financials[j].financial_capex)]);
        }
        break;
      }
      case 'F': {;
        this.line_ChartHeading = 'Annual Wage Bill Tax (£ 000s)'
        this.line_ChartData = [['Year', 'AWB']];
        for (j = 0; j < this.financials.length; j++) {
          this.line_ChartData.push([this.financials[j].financial_year_end,
            Number(this.financials[j].financial_annual_wage_bill)]);
        }
        break;
      }
      case 'G': {;
        this.line_ChartHeading = 'Average Spend (£)'
        this.line_ChartData = [['Year', 'AS']];
        for (j = 0; j < this.financials.length; j++) {
          this.line_ChartData.push([this.financials[j].financial_year_end,
            Number(this.financials[j].financial_average_spend)]);
        }
        break;
      }
    }
    this.drawGraph(this.line_ChartData, this.line_ChartOptions);
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  getFinancials(restaurant_id) {
    this.financialService.getForRestaurant(restaurant_id)
      .subscribe(
        data => {
          // console.log(JSON.stringify(data), data.financials.length);
          if (data.financials.length > 0) {
            this.translate.get('Financial.RecordsFoundFor').subscribe(
              value => { this.t_string = value; });
            this.financials = data.financials;
            this.financialslength = this.financials.length;
            this.setGraphData('B');
            // this.openSnackBar(data.financials.length + ' ' + this.t_string + ' ' + this.restaurant.restaurant_name, '');
          } else {
            this.translate.get('Financial.NoRecordsFoundFor').subscribe(
              value => { this.t_string = value; });
            this.financialslength = 0;
            // this.openSnackBar(this.t_string + ' ' + this.restaurant.restaurant_name, '');
          }
        },
        error => {
          this.translate.get('Financial.Error').subscribe(
            value => { this.t_string = value; });
          this.financialslength = 0;
          this.openSnackBar(this.t_string, '');
        });
  }

  addFinancial(restaurant_id) {
    let financial_index: number;
    if (this.financials) {
      // if some data already exists, add a new record to the end of that set so we can use the same form
      financial_index = this.financials.length;
    } else {
      financial_index = 0;
      this.financials.length = 0;
    }
    this.financials.push({
      financial_restaurant_id: restaurant_id,
      financial_year_end: '',
      financial_months:  '',
      financial_turnover:  '',
      financial_gross_profit:  '',
      financial_admin_costs: '',
      financial_profit_before_tax: '',
      financial_exceptions: '',
      financial_net_assets: '',
      financial_capex: '',
      financial_staff_count: '',
      financial_annual_wage_bill: '',
      financial_average_spend: '',
      financial_table_count:  '',
      financial_seat_count:  '',
      financial_property_size:  '',
      financial_property_rent:  '',
      financial_notes: '',
    });
    // console.log('index', financial_index);
    this.viewFinancialForm(restaurant_id, financial_index, true, 'add');
  }

  showFinancial(restaurant_id, financial_index) {
    this.viewFinancialForm(restaurant_id, financial_index, false, 'show');
  }

  editFinancial(restaurant_id, financial_index) {
    this.viewFinancialForm(restaurant_id, financial_index, true, 'edit');
  }

  delFinancial(restaurant_id, financial_index) {
    this.financialService._delete(this.financials[financial_index])
      .subscribe(
        data => {
          console.log('Deleted financial record');
          this.getFinancials(restaurant_id);
        },
        error => {
          console.log('Failed to delete financial record');
        });
  }

  viewFinancialForm(restaurant_id, financial_index, editMode, activateMode) {

    const selectedRestaurant = this.restaurant;
    const selectedFinancial = this.financials[financial_index];
    const dialogRef = this.dialog.open(FinancialDetailComponent);
    const yearendoptions = this.setYearEndOptions();

    // Setup dialog vars
    // console.log(financial_index, JSON.stringify(selectedFinancial));
    dialogRef.componentInstance.restaurant = selectedRestaurant;
    dialogRef.componentInstance.financial = selectedFinancial;
    dialogRef.componentInstance.editMode = editMode;
    dialogRef.componentInstance.yearendoptions = yearendoptions;

    // Whenever the dialog is closed
    dialogRef.afterClosed().subscribe(result => {

      // Create a hook into the dialog form - for additions remember to 'pop' the blank initiator
      const f: NgForm = dialogRef.componentInstance.financialForm;
      if (f.dirty) {
        // console.log(selectedFinancial);
        if (f.valid) {
          if (activateMode === 'add') {
            this.financials.pop();
            this.doFinanceAddition(restaurant_id, selectedFinancial);
          } else {
            this.doFinanceUpdate(restaurant_id, selectedFinancial);
          }
        } else {
          console.log('Form invalid, return message');
          // TODO this is in here only so that we can grab the data until we work out why the form is returning not valid
          // NB for the demo I have disabled this so we don't grab rubbish (since if you cancel from the form you end up here
          // if (activateMode === 'add') {
          //   this.financials.pop();
          //   this.doFinanceAddition(restaurant_id, selectedFinancial);
          // } else {
          //   this.doFinanceUpdate(restaurant_id, selectedFinancial);
          // }
        }
      } else {
        if (activateMode === 'add') {
          this.financials.pop();
        }
        // console.log('As you were, nothing changed');
      }
    });
  }

  doFinanceAddition(restaurant_id, financial) {
    // console.log('update', financial);
    // test by just pushing
    // this.financials.push(financial);
    this.financialService.create(financial)
      .subscribe(
        data => {
          console.log('Added new financial record');
          this.getFinancials(restaurant_id);
        },
        error => {
          console.log('Failed to add new financial record');
        });
  }

  doFinanceUpdate(restaurant_id, financial) {
    // console.log('update', financial);
    // test by just pushing
    // this.financials.push(financial);
    this.financialService.update(financial)
      .subscribe(
        data => {
          console.log('Updated financial record');
          this.getFinancials(restaurant_id);
        },
        error => {
          console.log('Failed to update financial record');
        });
  }

  setYearEndOptions () {
    // set options for year end to run from 2010 to the current year, but
    // do not include options for years that already exist in the record
    const year = new Date();
    const thisyear = year.getFullYear();
    const firstyear = 2010;
    let i: number;
    let j: number;
    let found = false;
    let yearendoptions: any[] = [];

    for (i = firstyear; i <= thisyear; i++) {
      found = false;
      for (j = 0; j < this.financials.length; j++) {
        if (Number(this.financials[j].financial_year_end) === i) {
          found = true;
        }
      }
      if (!found) {
        yearendoptions.push({ value: i, label: i });
      }
    }
    return yearendoptions;
  }

  benchmark() {
    const dialogRef = this.dialog.open(BenchmarkComponent);
    dialogRef.componentInstance.restaurant = this.restaurant;
    dialogRef.componentInstance.financials = this.financials;
  }

}
