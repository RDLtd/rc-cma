import { ElementRef, Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FinancialService } from '../_services/financial.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';;
import { FsLocalService } from '../fs/fs-local.service';
import { BenchmarkWizardComponent } from './benchmarkwizard.component';
import { BenchmarkComponent } from './benchmark.component';

declare const google: any;

@Component({
  selector: 'rc-review',
  templateUrl: './review.component.html'
})

export class ReviewComponent implements OnInit {

  @ViewChild('reviewView') reviewView: NgForm;
  restaurants: any[] = [];
  restaurantCount: Number;
  plotRestaurants: any[] = [];
  financials: any[] = [];

  graphDataOptions: any[] = [];
  areaDataOptions: any[] = [];

  graphDataSelection: any;
  areaDataSelection: any;

  latest_png;
  snapshot_counter = 0;
  snapshots: any[] = [];

  benchmark_index = 0;

  public line_ChartHeading: string;
  public line_ChartData;
  public line_ChartOptions  = {
    title: '',
    legend: {
      position: 'bottom',
      textStyle: {
        bold: true,
        fontSize: 12,
        color: '#4d4d4d'
      },
    },
    fontName: 'Roboto',
    fontSize: '14',
    pointSize: 10,
    chartArea: {
      left: 80,
      right: 24,
      top: 32
    }
  };
  public line_sub_ChartOptions  = {
    title: '',
    legend: {
      position: 'bottom',
      textStyle: {
        bold: true,
        fontSize: 8,
        color: '#4d4d4d'
      },
    },
    fontName: 'Roboto',
    fontSize: '8',
    pointSize: 4,
    chartArea: {
      left: 20,
      right: 4,
      top: 12
    }
  };

  constructor(public snackBar: MatSnackBar,
              private translate: TranslateService,
              public dialog: MatDialog,
              public element: ElementRef,
              public financialService: FinancialService,
              private fsLocalService: FsLocalService) {
  }

  ngOnInit() {
    // need to get translation for currency unit!
    this.graphDataOptions = [
      { index: 0, label: 'Turnover', units: '(£ 000s)',
        dataSource1: 'financial_turnover', dataSource2: '' },
      { index: 1, label: 'Gross Profit', units: '(£ 000s)',
        dataSource1: 'financial_gross_profit', dataSource2: '' },
      { index: 2, label: 'Administration Costs', units: '(£ 000s)',
        dataSource1: 'financial_admin_costs', dataSource2: '' },
      { index: 3, label: 'Profit Before Tax', units: '(£ 000s)',
        dataSource1: 'financial_profit_before_tax', dataSource2: '' },
      { index: 4, label: 'Exceptions', units: '(£ 000s)',
        dataSource1: 'financial_exceptions', dataSource2: '' },
      { index: 5, label: 'Net Assets', units: '(£ 000s)',
        dataSource1: 'financial_net_assets', dataSource2: '' },
      { index: 6, label: 'Capital Expenditure', units: 'Turnover (£ 000s)',
        dataSource1: 'financial_turnover', dataSource2: '' },
      { index: 7, label: 'Staff Count', units: '',
        dataSource1: 'financial_staff_count', dataSource2: '' },
      { index: 8, label: 'Annual Wage Bill', units: '(£ 000s)',
        dataSource1: 'financial_annual_wage_bill', dataSource2: '' },
      { index: 9, label: 'Average Spend', units: '(£)',
        dataSource1: 'financial_average_spend', dataSource2: '' },
      { index: 10, label: 'Annual Covers', units: '',
        dataSource1: 'financial_annual_covers', dataSource2: '' },
      { index: 11, label: 'Seat Count', units: '',
        dataSource1: 'financial_seat_count', dataSource2: '' },
      { index: 12, label: 'Property Size', units: '(m2)',
        dataSource1: 'financial_property_size', dataSource2: '' },
      { index: 13, label: 'Property Rent', units: '(£ 000s)',
        dataSource1: 'financial_property_rent', dataSource2: '' },
      { index: 14, label: 'GP as % Turnover', units: '(%)',
        dataSource1: 'financial_gross_profit', dataSource2: 'financial_turnover' },
      { index: 15, label: 'PBT as % Turnover', units: '(%)',
        dataSource1: 'financial_profit_before_tax', dataSource2: 'financial_turnover' },
      { index: 16, label: 'Annual Wage Bill as % Turnover', units: '(%)',
        dataSource1: 'financial_annual_wage_bill', dataSource2: 'financial_turnover' }
    ];

    this.graphDataSelection = this.graphDataOptions[0];
    this.areaDataSelection = this.areaDataOptions[0];
    this.snapshots.length = 0;

    // Subscribe to local service so that we can observe/pass data between child components
    this.fsLocalService.getRestaurants()
      .subscribe(data => {
          this.restaurantCount = data.length;
          // seems we might not have any data on first pass?
          if (this.restaurantCount) {
            this.restaurants = data;
            // console.log(JSON.stringify(this.restaurants));
            if (this.restaurants.length === 0) {
              // this.openSnackBar('You must have at least one associated restaurant!', '');
              const dialogRef = this.dialog.open(BenchmarkWizardComponent);
              dialogRef.componentInstance.associatedRestaurants = this.restaurants;
              dialogRef.componentInstance.primary_text = 'In order to do benchmarking, you must have at least one associated restaurant!';
              return;
            }
            // now check to see if any of the associated restaurants have financial data
            let have_financial_data = false;
            for (let i = 0; i < this.restaurants.length; i++) {
              this.financialService.getForRestaurant(this.restaurants[i].restaurant_id)
                .subscribe(
                  fdata => {
                    // console.log(JSON.stringify(data), data.financials.length);
                    if (fdata.financials.length > 0) {
                      have_financial_data = true;
                      // set a field in the restaurant record for convenience
                      this.restaurants[i].financial_data = true;
                    } else {
                      this.restaurants[i].financial_data = false;
                    }
                    // on the last pass check to see if we need to exit
                    if (i === this.restaurants.length - 1) {
                      if (!have_financial_data) {
                        const dialogRef = this.dialog.open(BenchmarkWizardComponent);
                        dialogRef.componentInstance.associatedRestaurants = this.restaurants;
                        dialogRef.componentInstance.primary_text = 'None of your associated restaurants have any financial data recorded!' +
                          ' In order to compare your restaurant with others you must provide appropriate data.';
                        return;
                      }
                      // have some data so we can move directly to review
                      let j, r;
                      this.plotRestaurants.length = 0;
                      for (j = 0; j < this.restaurantCount; j++) {
                        r = this.restaurants[j];
                        if (r.financial_data) {
                          r.plot_candidate = true;
                          this.plotRestaurants.push(r);
                        } else {
                          r.plot_candidate = false;
                        }
                      }
                      // console.log(JSON.stringify(this.plotRestaurants));
                      this.benchmark_index = 0;
                      this.showData();
                    }
                  });
            }
          }
      });
  }

  setPlotRestaurants() {
    this.plotRestaurants.length = 0;
    for (let i = 0; i < this.restaurants.length; i++) {
      if (this.restaurants[i].plot_candidate) {
        this.plotRestaurants.push(this.restaurants[i]);
      }
    }
    this.showData();
  }

  plotChanged() {
    this.setPlotRestaurants();
  }

  addData(index) {
    console.log('Add data for restaurant ' + index);
  }

  editData(index) {
    console.log('Edit data for restaurant ' + index);
  }

  benchmark(index) {
    console.log('Benchmark restaurant ' + index);
    const dialogRef = this.dialog.open(BenchmarkComponent);
    dialogRef.componentInstance.restaurant = this.restaurants[index];
    dialogRef.componentInstance.financials = this.financials;
  }

  printGraph() {
    console.log('print the current graph');
    const originalImage = '<img id="imageViewer" src="' + localStorage.getItem('png_save') + '"';
    const popup =  window.open('', '_blank', '');
    popup.document.open();
    popup.document.write("<html><head></head><body onload='print()'>");
    popup.document.write(originalImage);
    popup.document.write('</body></html>');
    popup.document.close();
    popup.close();
  }

  saveGraph () {
    console.log('save the current graph');
    const download = document.createElement('a');
    download.href = localStorage.getItem('png_save');
    download.download = this.line_ChartHeading + '-graph.png';
    download.click();
  }

  switchGraph (index) {
    console.log('switch ' + index);
  }

  addSnapshot() {
    console.log('add this graph to the snapshots');
    const chart_div = document.getElementById('benchmark_chart');
    this.latest_png = localStorage.getItem('png_save');
    this.snapshots.push(this.latest_png);
    this.snapshot_counter = this.snapshot_counter + 1;
    // console.log(this.latest_png);
  }

  deleteSnapshot() {
    this.snapshots.pop();
    this.snapshot_counter = this.snapshot_counter - 1;
  }

  printSnapshots() {
    console.log('print the snapshots');
  }

  saveSnapshots() {
    console.log('save the snapshots');
  }

  // This cloned and adapted from the Google-Charts component
  drawGraph(chartData, chartOptions) {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);
    // drawChart();
    function drawChart() {
      const chart_div = document.getElementById('benchmark_chart');
      const chart = new google.visualization.LineChart(chart_div);
      // Wait for the chart to finish drawing before calling the getImageURI() method.
      google.visualization.events.addListener(chart, 'ready', function () {
        // chart_div.innerHTML = '<img src="' + chart.getImageURI() + '">';
        localStorage.setItem('png_save', chart.getImageURI());
        // console.log(chart_div.innerHTML);
      });
      chart.draw(chartData, chartOptions);
    }
  }

  showData() {
    // plot the data in array plotRestaurants

    // this just here for testing for benchmarking
    this.areaDataOptions = [
      { index: 0, label: 'All' },
      { index: 1, label: 'In same post code (' +
      this.plotRestaurants[this.benchmark_index].restaurant_post_code.substring(0,
        this.plotRestaurants[this.benchmark_index].restaurant_post_code.indexOf(' ')) + ')' },
      { index: 2, label: 'In same region (' + this.plotRestaurants[this.benchmark_index].restaurant_region + ')' },
      { index: 3, label: 'Within 10km' },
      { index: 4, label: 'All' }
    ];

    //
    // first get all the relevant financial records
    this.financials.length = 0;
    for (let i = 0; i < this.plotRestaurants.length; i++) {
        this.financialService.getForRestaurant(this.plotRestaurants[i].restaurant_id)
          .subscribe(
            data => {
              if (data.financials.length > 0) {
                for (let j = 0; j < data.financials.length; j++) {
                  this.financials.push( {
                    'name': this.plotRestaurants[i].restaurant_name,
                    'data': data.financials[j] });
                }
              }
              if (i === this.plotRestaurants.length - 1) {
                // have all the data now, so can proceed to assemble plot
                this.setGraphData(0);
              }
            });
    }
  }

  setGraphData(index) {
    // console.log(index);
    this.setArrays(this.graphDataOptions[index].label + ' ' + this.graphDataOptions[index].units,
      this.graphDataOptions[index].dataSource1, this.graphDataOptions[index].dataSource2);
  }

  setArrays(header, dataSource1, dataSource2) {
    // this routine now also handles two datasources, just checks for dataSource2 === ''
    // see definition of data structure in ngInit
    this.line_ChartHeading = header;
    this.line_ChartOptions['vAxis'] = {
      title: header,
      titleTextStyle : {
        fontSize: 16
      }
    };
    this.line_sub_ChartOptions.title = header;


    // console.log(header, dataSource1, dataSource2);
    // before we start, we need to get the year range for the plotted restaurants
    let year_start = 3000;
    let year_end = 1000;
    for (let i = 0; i < this.financials.length; i++) {
      if (Number(this.financials[i].data.financial_year_end) < year_start) {
        year_start = Number(this.financials[i].data.financial_year_end);
      }
      if (Number(this.financials[i].data.financial_year_end) > year_end) {
        year_end = Number(this.financials[i].data.financial_year_end);
      }
    }

    this.line_ChartData  = new google.visualization.DataTable();
    this.line_ChartData.addColumn('string', 'Year');
    // all other columns are of type 'number'.
    for (let i = 0; i < this.plotRestaurants.length; i++) {
      this.line_ChartData.addColumn('number', this.plotRestaurants[i].restaurant_name);
    }

    // now add the rows - need to do this dynamically since we don't know how many column values
    for (let i = year_start; i <= year_end; i++) {
      // assemble the row
      const row = [];
      row.push(i.toString());
      for (let j = 0; j < this.plotRestaurants.length; j++) {
        for (let k = 0; k < this.financials.length; k++) {
          if (i === Number(this.financials[k].data.financial_year_end) &&
            this.financials[k].name === this.plotRestaurants[j].restaurant_name) {
            if (dataSource2 === '') {
              row.push(Number(this.financials[k].data[dataSource1]));
            } else {
              row.push(Number(this.financials[k].data[dataSource1] /
                Number(this.financials[k].data[dataSource2]) * 100));
            }
          }
        }
      }
      this.line_ChartData.addRow(row);
    }
    // console.log(JSON.stringify(this.line_ChartData));
    this.drawGraph(this.line_ChartData, this.line_ChartOptions);
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

}
