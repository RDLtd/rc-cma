import { Directive, ElementRef, Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FinancialService } from '../_services';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';


declare var google: any;

@Component({
  selector: 'rc-benchmark',
  templateUrl: './benchmark.component.html'
})


export class BenchmarkComponent implements OnInit {

  @ViewChild('benchmarkView', {static: true}) benchmarkView: NgForm;
  restaurant: any;
  financials: any[] = [];
  financialslength: number;
  benchmarks: any[] = [];
  fullbenchmarks: any[] = [];
  benchmarkslength: number;
  benchmarksrestaurantcount: number;
  t_string: string;

  graphDataOptions: any[] = [];
  calculatedDataOptions: any[] = [];
  graphDataSelection: any;
  areaDataOptions: any[] = [];
  areaDataSelection: any;
  cuisineDataOptions: any[] = [];
  cuisineDataSelection: any;
  bookingDataOptions: any[] = [];
  bookingDataSelection: any;
  includeMe: any;

  public line_ChartHeading: string;
  public line_ChartData = [];
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
    chartArea: {
      left: 80,
      right: 24,
      top: 32
    }
  };

  public g_ChartOptions = {
        width: 480,
        height: 80,
        min: 1,
        max: 14,
        // redFrom: 100,
        // redTo: 100,
        // yellowFrom: 100,
        // yellowTo: 100,
        minorTicks: 1
      };

  public g_ChartData = [];

  constructor(public snackBar: MatSnackBar,
              private translate: TranslateService,
              public dialog: MatDialog,
              public element: ElementRef,
              public financialService: FinancialService) {

    // this._element = this.element.nativeElement;
  }

  ngOnInit() {
    this.graphDataOptions.push({ value: 'A', label: 'Turnover' });
    this.graphDataOptions.push({ value: 'B', label: 'Gross Profit' });
    this.graphDataOptions.push({ value: 'C', label: 'Administration Costs' });
    this.graphDataOptions.push({ value: 'D', label: 'Profit Before Tax' });
    this.graphDataOptions.push({ value: 'E', label: 'Exceptions' });
    this.graphDataOptions.push({ value: 'F', label: 'Net Assets' });
    this.graphDataOptions.push({ value: 'G', label: 'Capital Expenditure' });
    this.graphDataOptions.push({ value: 'H', label: 'Staff Count' });
    this.graphDataOptions.push({ value: 'I', label: 'Annual Wage Bill' });
    this.graphDataOptions.push({ value: 'J', label: 'Average Spend' });
    this.graphDataOptions.push({ value: 'K', label: 'Annual Covers' });
    this.graphDataOptions.push({ value: 'L', label: 'Seat Count' });
    this.graphDataOptions.push({ value: 'M', label: 'Property Size' });
    this.graphDataOptions.push({ value: 'N', label: 'Property Rent' });
    this.calculatedDataOptions.push({ value: 'O', label: 'GP as % Turnover' });
    this.calculatedDataOptions.push({ value: 'P', label: 'PBT as % Turnover' });
    this.calculatedDataOptions.push({ value: 'Q', label: 'Annual Wage Bill as % Turnover' });
    this.graphDataSelection = { value: 'B', label: 'Gross Profit' };

    this.areaDataOptions.push({ value: 'A', label: 'All' });
    this.areaDataOptions.push({ value: 'B', label: 'In same post code (' +
    this.restaurant.restaurant_post_code.substring(0, this.restaurant.restaurant_post_code.indexOf(' ')) + ')' });
    this.areaDataOptions.push({ value: 'C', label: 'In same region (' + this.restaurant.restaurant_region + ')' });
    this.areaDataOptions.push({ value: 'D', label: 'Within 10km' });
    this.areaDataSelection = { value: 'A', label: 'All' };

    this.cuisineDataOptions.push({ value: 'A', label: 'Any' });
    this.cuisineDataOptions.push({ value: 'B', label: 'Same (' + this.restaurant.restaurant_cuisine_1 + ')' });
    this.cuisineDataSelection = { value: 'A', label: 'Any' };

    this.bookingDataOptions.push({ value: 'A', label: 'Any' });
    this.bookingDataOptions.push({ value: 'B', label: 'Same (' + this.restaurant.restaurant_booking_1 + ')' });
    this.bookingDataSelection = { value: 'A', label: 'Any' };

    this.includeMe = true;

    this.financialslength = this.financials.length;
    this.getBenchmarkData('A'); // start with turnover
    this.getRankingData();

  }


  // This cloned and adapted from the Google-Charts component
  drawGraph(chartData, chartOptions) {
    // google.charts.setOnLoadCallback(drawChart); // don't seem to need this since we have already loaded the instance
    drawChart();
    function drawChart() {
      const wrapper = new google.visualization.ChartWrapper({
        chartType: 'LineChart',
        dataTable: chartData,
        options: chartOptions || {},
        containerId: 'benchmark_chart'
      });
      wrapper.draw();
    }
  }

  doBenchmarking() {
    // get the new set of records and replot the data
    // adjust the benchmarks data set according to the various filters, start from the full set...
    this.benchmarks.length = 0;
    console.log(this.fullbenchmarks.length);
    for (let j = 0; j < this.fullbenchmarks.length; j++) {
      let included = true;
      // these options are inclusive (so AND) hence we do not need to check if 'all' has been selected
      switch (this.areaDataSelection.value) {
        // case 'A': { // All
        //   included = true;
        //   break;
        // }
        case 'B': { // Post Code
          if (this.fullbenchmarks[j].restaurant_post_code.substring(0,
            this.fullbenchmarks[j].restaurant_post_code.indexOf(' ')) !==
            this.restaurant.restaurant_post_code.substring(0, this.restaurant.restaurant_post_code.indexOf(' '))) {
            included = false;
          }
          break;
        }
        case 'C': { // Region
          if (this.fullbenchmarks[j].restaurant_region !== this.restaurant.restaurant_region) {
            included = false;
          }
          break;
        }
        case 'D': { // Distance
          included = true;
          break;
        }
      }

      if (included) {
        switch (this.cuisineDataSelection.value) {
          // case 'A': { // All
          //   included = true;
          //   break;
          // }
          case 'B': { // Cuisine
            if (this.fullbenchmarks[j].restaurant_cuisine_1 !== this.restaurant.restaurant_cuisine_1) {
              included = false;
            }
            break;
          }
        }
      }

      if (included) {
        switch (this.bookingDataSelection.value) {
          // case 'A': { // All
          //   included = true;
          //   break;
          // }
          case 'B': { // Booking
            if (this.fullbenchmarks[j].restaurant_booking_1 !== this.restaurant.restaurant_booking_1) {
              included = false;
            }
            break;
          }
        }
      }

      if (included) {
        if (!this.includeMe) {
          if (this.fullbenchmarks[j].restaurant_id === this.restaurant.restaurant_id) {
            included = false;
          }
        }
      }

      if (included) {
        this.benchmarks.push(this.fullbenchmarks[j]);
      }
    }
    this.benchmarkslength = this.benchmarks.length;
    this.countRestaurants();
    this.setGraphData(this.graphDataSelection.value);
  }

  setGraphData(code) {
    switch (code) {
      case 'A': {
        this.setArrays('Turnover (£ 000s)', 'financial_turnover');
        break;
      }
      case 'B': {
        this.setArrays('Gross Profit (£ 000s)', 'financial_gross_profit');
        break;
      }
      case 'C': {
        this.setArrays('Administration Costs (£ 000s)', 'financial_admin_costs');
        break;
      }
      case 'D': {
        this.setArrays('Profit Before Tax (£ 000s)', 'financial_profit_before_tax');
        break;
      }
      case 'E': {
        this.setArrays('Exceptions (£ 000s)', 'financial_exceptions');
        break;
      }
      case 'F': {
        this.setArrays('Net Assets (£ 000s)', 'financial_net_assets');
        break;
      }
      case 'G': {
        this.setArrays('Capital Expenditure (£ 000s)', 'financial_capex');
        break;
      }
      case 'H': {
        this.setArrays('Staff Count', 'financial_staff_count');
        break;
      }
      case 'I': {
        this.setArrays('Annual Wage Bill (£ 000s)', 'financial_annual_wage_bill');
        break;
      }
      case 'J': {
        this.setArrays('Average Spend (£)', 'financial_average_spend');
        break;
      }
      case 'K': {
        this.setArrays('Annual Covers', 'financial_annual_covers');
        break;
      }
      case 'L': {
        this.setArrays('Seat Count', 'financial_seat_count');
        break;
      }
      case 'M': {
        this.setArrays('Property Size (m2)', 'financial_property_size');
        break;
      }
      case 'N': {
        this.setArrays('Property Rent (£ 000s)', 'financial_property_rent');
        break;
      }
      case 'O': {
        this.setCalculatedArrays('GP as % Turnover (%)', 'financial_gross_profit', 'financial_turnover');
        break;
      }
      case 'P': {
        this.setCalculatedArrays('PBT as % Turnover (%)', 'financial_profit_before_tax', 'financial_turnover');
        break;
      }
      case 'Q': {
        this.setCalculatedArrays('Annual Wage Bill as % Turnover (%)', 'financial_annual_wage_bill', 'financial_turnover');
        break;
      }
    }
  }

  setArrays(header, dataSource) {
    // set the chart data arrays - use dataSource as the variable name - cunning JS feature...
    let i: number;
    let j: number;
    let benchmark_min = [];
    let benchmark_max = [];
    let benchmark_mean = [];
    let benchmark_count = [];

    this.line_ChartHeading = header;
    this.line_ChartData = [[ 'Year', 'Mean', 'Min', 'Max', this.restaurant.restaurant_name ]];
    console.log(this.financials.length);
    // loop through each year
    for (i = 0; i < this.financials.length; i++) {

      benchmark_min[i] = 99999;
      benchmark_max[i] = -99999;
      benchmark_mean[i] = 0;
      benchmark_count[i] = 0;

      for (j = 0; j < this.benchmarks.length; j++) {
        // just the right data for this year
        if (this.financials[i].financial_year_end === this.benchmarks[j].financial_year_end) {
          benchmark_count[i] = benchmark_count[i] + 1;
          benchmark_mean[i] = benchmark_mean[i] + Number(this.benchmarks[j][dataSource]);
          if (Number(this.benchmarks[j][dataSource]) > benchmark_max[i]) {
            benchmark_max[i] = Number(this.benchmarks[j][dataSource]);
          }
          if (Number(this.benchmarks[j][dataSource]) < benchmark_min[i]) {
            benchmark_min[i] = Number(this.benchmarks[j][dataSource]);
          }
        }
      }
      // TODO need only calculate the mean if there are at least 'n' points
      // The issue will be how to mark those points... Probably need NOT to push them..
      // but then we need still to push the other values...
      benchmark_mean[i] = benchmark_mean[i] / benchmark_count[i];
      // console.log(i, benchmark_count[i], benchmark_mean[i], benchmark_min[i], benchmark_max[i]);
    }

    for (i = 0; i < this.financials.length; i++) {
      this.line_ChartData.push([
        this.financials[i].financial_year_end,
        benchmark_mean[i],
        benchmark_min[i],
        benchmark_max[i],
        Number(this.financials[i][dataSource])
      ]);
    }
    // TODO this is where we really need to be able to trigger a redraw - we have changed the data...
    // (and of course in the other function below)
    console.log(JSON.stringify(this.line_ChartData));
    this.drawGraph(this.line_ChartData, this.line_ChartOptions);
  }

  setCalculatedArrays(header, dataSource1, dataSource2) {
    // set the chart data arrays - here calculate dataSource1 as a percentage of dataSource2
    let i: number;
    let j: number;
    let percentage: number;
    let benchmark_min = [];
    let benchmark_max = [];
    let benchmark_mean = [];
    let benchmark_count = [];

    this.line_ChartHeading = header;
    this.line_ChartData = [[ 'Year', 'Mean', 'Min', 'Max', this.restaurant.restaurant_name ]];
    console.log(this.financials.length);
    // loop through each year
    for (i = 0; i < this.financials.length; i++) {

      benchmark_min[i] = 99999;
      benchmark_max[i] = -99999;
      benchmark_mean[i] = 0;
      benchmark_count[i] = 0;

      for (j = 0; j < this.benchmarks.length; j++) {
        // just the right data for this year
        percentage = Number(this.benchmarks[j][dataSource1]) / Number(this.benchmarks[j][dataSource2]) * 100;
        if (this.financials[i].financial_year_end === this.benchmarks[j].financial_year_end) {
          benchmark_count[i] = benchmark_count[i] + 1;
          benchmark_mean[i] = benchmark_mean[i] + percentage;
          if (percentage > benchmark_max[i]) {
            benchmark_max[i] = percentage;
          }
          if (percentage < benchmark_min[i]) {
            benchmark_min[i] = percentage;
          }
        }
      }
      benchmark_mean[i] = benchmark_mean[i] / benchmark_count[i];
      // console.log(i, benchmark_count[i], benchmark_mean[i], benchmark_min[i], benchmark_max[i]);
    }

    for (i = 0; i < this.financials.length; i++) {
      this.line_ChartData.push([
        this.financials[i].financial_year_end,
        benchmark_mean[i],
        benchmark_min[i],
        benchmark_max[i],
        Number(this.financials[i][dataSource1] / Number(this.financials[i][dataSource2]) * 100)
      ]);
    }
    this.drawGraph(this.line_ChartData, this.line_ChartOptions);
    console.log(JSON.stringify(this.line_ChartData));
  }

  getBenchmarkData(code) {
    // load a dataset of financial data based on the parameters chosen in the drop downs
    // test data - get them all...
    this.financialService.getAll()
      .subscribe(
        data => {
          // console.log(JSON.stringify(data), data.financials.length);
          // if (data.financials.length > 0) {
          //   this.benchmarks = data.financials;
          //   // make another copy so we don't need to re-read the database
          //   this.fullbenchmarks = this.benchmarks.slice();
          //   console.log(this.fullbenchmarks.length);
          //   this.benchmarkslength = this.benchmarks.length;
          //   this.countRestaurants();
          //   this.setGraphData(code);
          // } else {
          //   this.benchmarks.length = 0;
          // }
        },
        error => {
          this.translate.get('Financial.Error').subscribe(
            value => { this.t_string = value; });
          this.financialslength = 0;
          this.openSnackBar(this.t_string, '');
        });
  }

  countRestaurants() {
    // determine number of restaurants are in the benchmark data set
    let benchmark_restaurants = [];
    if (this.benchmarks.length > 0) {
      benchmark_restaurants[0] = this.benchmarks[0].financial_restaurant_id;
      this.benchmarksrestaurantcount = 1;
      for (let j = 1; j < this.benchmarks.length; j++) {
        if (!this.inArray(this.benchmarks[j].financial_restaurant_id, benchmark_restaurants)) {
          this.benchmarksrestaurantcount = this.benchmarksrestaurantcount + 1;
          benchmark_restaurants.push(this.benchmarks[j].financial_restaurant_id);
        }
      }
    } else {
      this.benchmarksrestaurantcount = 0;
    }
  }

  inArray(needle, haystack) {
      const count = haystack.length;
      for (let i = 0; i < count; i++) {
        if (haystack[i] === needle) { return true; }
      }
      return false;
    }

  setAreaData(code) {
    this.doBenchmarking();
  }

  setCuisineData(code) {
    this.doBenchmarking();
  }

  setBookingData(code) {
    this.doBenchmarking();
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
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

  getRankingData () {
    // ranking will be as a percentage point relative to the sorted list of all values for the comparator list
    //
    // this.benchmarks contains the raw data
    this.g_ChartData = [['Label', 'Value']];
    for (let i = 0; i < this.financials.length; i++) {
      this.g_ChartData.push([ this.financials[i].financial_year_end, 6 ]);
    }
    //
    // this.g_ChartData.push(['2011', 80]);
    // this.g_ChartData.push(['2012', 55]);
    // this.g_ChartData.push(['2013', 68]);
    // this.g_ChartData.push(['2014', 80]);
    // this.g_ChartData.push(['2015', 55]);
    // this.g_ChartData.push(['2016', 68]);
  }

}
