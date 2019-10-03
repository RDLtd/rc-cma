import { ElementRef, Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FinancialService } from '../../_services';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from 'ng2-translate';
import { FsLocalService } from '../fs-local.service';
import { BenchmarkWizardComponent } from '../../restaurants';

declare const google: any;

@Component({
  selector: 'rc-fs-graph',
  templateUrl: './fs-graph.component.html'
})

export class FsGraphComponent implements OnInit {

  @ViewChild('reviewView') reviewView: NgForm;
  fsViewLabel = 'review';

  restaurants: any[] = [];
  restaurantCount: Number;
  plotRestaurants: any[] = [];
  financials: any[] = [];
  benchmarks: any[] = [];
  fullbenchmarks: any[] = [];
  benchmarks_length: number;
  benchmarks_restaurant_count: number;
  benchmarks_text;

  graphDataOptions: any[] = [];
  areaDataOptions: any[] = [];
  cuisineDataOptions: any[] = [];
  groupDataOptions: any[] = [];
  view_group = false;
  view_group_enabled;
  graph_texts: string[] = [];
  include_restaurant = false;
  current_restaurant;

  graphDataSelection: any;
  areaDataSelection: any;
  cuisineDataSelection: any;
  groupDataSelection: any;

  latest_png;
  master_plot_index = 0;
  sub_plot_index: number[] = [];
  snapshot_counter = 0;
  snapshots: any[] = [];

  review = false;
  review_text = 'Review';
  benchmark_index = 0;
  my_benchmark_candidate;

  t_string;
  section_heading = 'Profit and Loss';

  public line_ChartHeading: string;
  public line_ChartData;
  public line_sub_ChartData: any[] = [];
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
  public line_sub_ChartOptions: any[] = [];
  public line_sub_ChartOption  = {
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

    this.graphDataOptions = this.fsLocalService.getGraphOptions();

    // set plotting indices
    this.master_plot_index = 0;
    for (let i = 0; i < this.graphDataOptions.length - 1; i++) {
      this.sub_plot_index.push(i + 1);
      this.line_sub_ChartOptions.push(this.line_sub_ChartOption);
    }

    this.graphDataSelection = this.graphDataOptions[0];
    this.section_heading = this.graphDataSelection.section;
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
                  // console.log(JSON.stringify(fdata), fdata.financials.length);
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
                    // cannot assume first one is viable...
                    let set_first = false;
                    for (j = 0; j < this.restaurants.length; j++) {
                      if (this.restaurants[j].financial_data && !set_first) {
                        this.benchmark_index = j;
                        this.restaurants[j].benchmark_candidate =  true;
                        this.my_benchmark_candidate = this.restaurants[j].restaurant_name;
                        set_first = true;
                      } else {
                        this.restaurants[j].benchmark_candidate =  false;
                      }
                      // console.log(this.restaurants[j].benchmark_candidate);
                    }
                    if (this.plotRestaurants.length > 2) {
                      this.view_group_enabled = true;
                    } else {
                      this.view_group_enabled = false;
                    }
                    this.review_text = 'Review';
                    this.review = true;
                    this.showData();
                    this.benchmarkChanged(0);
                  }
                });
          }
        }
      });
  }

  setFSView(view) {
    this.fsViewLabel = view;
    // console.log(view);
    if (view === 'review') {
      // these could obviously be the same as 'view'
      this.review_text = 'Review';
      this.review = true;
    } else {
      this.review_text = 'Benchmark';
      this.review = false;
      this.benchmarkChanged(0);
    }
    this.showData();
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
    if (this.plotRestaurants.length > 2) {
      this.view_group_enabled = true;
    } else {
      this.view_group_enabled = false;
      this.view_group = false;
    }
  }

  benchmarkChanged(index) {
    this.benchmark_index = index;
    this.current_restaurant = this.restaurants[this.benchmark_index].restaurant_name;
    this.areaDataOptions = [
      { index: 0, label: 'All' },
      { index: 1, label: 'In same post code (' +
      this.restaurants[this.benchmark_index].restaurant_post_code.substring(0,
        this.restaurants[this.benchmark_index].restaurant_post_code.indexOf(' ')) + ')' },
      { index: 2, label: 'In same region (' + this.restaurants[this.benchmark_index].restaurant_region + ')' },
      { index: 3, label: 'Within 2km' },
      { index: 4, label: 'Within 5km' },
      { index: 5, label: 'Within 10km' },
      { index: 6, label: 'Within 20km' }
    ];
    this.areaDataSelection = this.areaDataOptions[0];

    this.cuisineDataOptions = [
      { index: 0, label: 'Any' },
      { index: 1, label: 'Same (' + this.restaurants[this.benchmark_index].restaurant_cuisine_1 + ')' }
    ];
    this.cuisineDataSelection = this.cuisineDataOptions[0];

    if (this.restaurants[this.benchmark_index].restaurant_group_name !== '' ) {
      this.groupDataOptions = [
        { index: 0, label: 'Any' },
        { index: 1, label: 'Same (' + this.restaurants[this.benchmark_index].restaurant_group_name + ')' }
      ];
    } else {
      this.groupDataOptions = [
        { index: 0, label: 'Not part of a group' }
      ];
    }
    this.groupDataSelection = this.groupDataOptions[0];
    // now get the benchmarking data set and show the data
    // the default is to compare against ALL restaurants for which we have data
    this.financialService.getAll()
      .subscribe(
        data => {
          // console.log(JSON.stringify(data), data.financials.length);
          if (data.financials.length > 0) {
            this.benchmarks = data.financials;
            // make another copy so we don't need to re-read the database
            this.fullbenchmarks = this.benchmarks.slice();
            // console.log(this.fullbenchmarks.length);
            // might need to remove this restaurant from the list
            if (!this.include_restaurant) {
              this.benchmarks.length = 0;
              for (let j = 1; j < this.fullbenchmarks.length; j++) {
                if (this.fullbenchmarks[j].restaurant_id !== this.restaurants[this.benchmark_index].restaurant_id) {
                  this.benchmarks.push(this.fullbenchmarks[j]);
                }
              }
            }
            this.benchmarks_length = this.benchmarks.length;
            this.countRestaurants();
            this.showData();
          } else {
            this.benchmarks.length = 0;
          }
        },
        error => {
          this.translate.get('Financial.Error').subscribe(
            value => { this.t_string = value; });
          this.benchmarks_length = 0;
          this.openSnackBar(this.t_string, '');
        });
  }

  countRestaurants() {
    // determine number of restaurants are in the benchmark data set
    const benchmark_restaurants = [];
    if (this.benchmarks.length > 0) {
      benchmark_restaurants[0] = this.benchmarks[0].financial_restaurant_id;
      this.benchmarks_restaurant_count = 1;
      for (let j = 1; j < this.benchmarks.length; j++) {
        if (!this.inArray(this.benchmarks[j].financial_restaurant_id, benchmark_restaurants)) {
          this.benchmarks_restaurant_count = this.benchmarks_restaurant_count + 1;
          benchmark_restaurants.push(this.benchmarks[j].financial_restaurant_id);
        }
      }
      if (this.include_restaurant) {
        if (this.benchmarks_restaurant_count === 1) {
          this.benchmarks_text = 'Only ' + this.my_benchmark_candidate + ' is in this benchmarking set';
        } else {
          this.benchmarks_text = 'Comparing ' + this.my_benchmark_candidate + ' with a set of ' +
            this.benchmarks_restaurant_count + ' restaurants';
        }
      } else {
        if (this.benchmarks_restaurant_count === 1) {
          this.benchmarks_text = 'Comparing ' + this.my_benchmark_candidate + ' with ' +
            this.benchmarks_restaurant_count + ' other restaurant';
        } else {
          this.benchmarks_text = 'Comparing ' + this.my_benchmark_candidate + ' with ' +
            this.benchmarks_restaurant_count + ' other restaurants';
        }
      }
    } else {
      this.benchmarks_restaurant_count = 0;
      this.benchmarks_text = 'There are no restaurants that meet these criteria';
    }
  }

  inArray(needle, haystack) {
    const count = haystack.length;
    for (let i = 0; i < count; i++) {
      if (haystack[i] === needle) { return true; }
    }
    return false;
  }

  addData(index) {
    console.log('Add data for restaurant ' + index);
  }

  editData(index) {
    console.log('Edit data for restaurant ' + index);
  }

  printGraph() {
    // console.log('print the current graph');
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
    // console.log('save the current graph');
    const download = document.createElement('a');
    download.href = localStorage.getItem('png_save');
    download.download = 'fs-graph.png';
    download.click();
    this.openSnackBar('Graph saved to fs-graph.png in your Downloads folder', '');
  }

  switchGraph (index) {
    //console.log('switch to ' + index);
    this.master_plot_index = this.sub_plot_index[index];
    this.showData();
  }

  setSubCharts() {
    // // switch the graphs around according to the required subplots
    let i = 0;
    for (let j = 0; j < this.graphDataOptions.length; j++) {
      if (j !== this.master_plot_index) {

        this.setsubArrays(
          i,
          this.graphDataOptions[j].label,
          this.graphDataOptions[j].label + ' ' + this.graphDataOptions[j].units,
          this.graphDataOptions[j].dataSource1,
          this.graphDataOptions[j].dataSource2
        );
        this.sub_plot_index[i] = j;
        i++;
      }
    }
  }

  viewGroup() {
    // console.log('view as group ' + this.view_group);
    this.showData();
  }

  addSnapshot() {
    // console.log('add this graph to the snapshots');
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

  saveSnapshots() {
    // console.log('save the snapshots');
    if (this.snapshots.length > 0) {
      for (let j = 0; j < this.snapshots.length; j++) {
        const download = document.createElement('a');
        download.href = this.snapshots[j];
        download.download = 'fs-snapshot-' + j + '-graph.png';
        download.click();
      }
      this.openSnackBar('Snapshots saved to your Downloads folder', '');
    } else {
      this.openSnackBar('No snapshots to save', '');
    }
  }

  setGroupData(code) {
    // console.log('set group data', JSON.stringify(code));
    this.updateBenchmarkData();
  }

  setAreaData(code) {
    // console.log('set area data', JSON.stringify(code));
    this.updateBenchmarkData();
  }

  setCuisineData(code) {
    // console.log('set cuisine data', JSON.stringify(code));
    this.updateBenchmarkData();
  }

  includeRestaurant() {
    this.updateBenchmarkData();
  }

  updateBenchmarkData() {
    // construct a new benchmarking set from options selected by user
    // note that we do not need to re-read the database since this.fullbenchmarks has the complete set
    this.benchmarks.length = 0;
    // console.log('checking ' + this.fullbenchmarks.length);
    for (let j = 0; j < this.fullbenchmarks.length; j++) {
      let included = true;
      // these options are inclusive (so AND) hence we do not need to check if 'all' has been selected
      switch (this.areaDataSelection.index) {
        case 1: { // Post Code
          if (this.fullbenchmarks[j].restaurant_post_code.substring(0,
              this.fullbenchmarks[j].restaurant_post_code.indexOf(' ')) !==
            this.restaurants[this.benchmark_index].restaurant_post_code.substring(0,
              this.restaurants[this.benchmark_index].restaurant_post_code.indexOf(' '))) {
            included = false;
          }
          break;
        }
        case 2: { // Region
          if (this.fullbenchmarks[j].restaurant_region !==
            this.restaurants[this.benchmark_index].restaurant_region) {
            included = false;
          }
          break;
        }
        case 3: { // Distance 2km
          if (!this.restaurantInLimit(this.fullbenchmarks[j].restaurant_lat,
              this.fullbenchmarks[j].restaurant_lng,
              this.restaurants[this.benchmark_index].restaurant_lat,
              this.restaurants[this.benchmark_index].restaurant_lng, 2)) {
            included = false;
          }
          break;
        }
        case 4: { // Distance 5km
          if (!this.restaurantInLimit(this.fullbenchmarks[j].restaurant_lat,
              this.fullbenchmarks[j].restaurant_lng,
              this.restaurants[this.benchmark_index].restaurant_lat,
              this.restaurants[this.benchmark_index].restaurant_lng, 5)) {
            included = false;
          }
          break;
        }
        case 5: { // Distance 10km
          if (!this.restaurantInLimit(this.fullbenchmarks[j].restaurant_lat,
              this.fullbenchmarks[j].restaurant_lng,
              this.restaurants[this.benchmark_index].restaurant_lat,
              this.restaurants[this.benchmark_index].restaurant_lng, 10)) {
            included = false;
          }
          break;
        }
        case 6: { // Distance 20km
          if (!this.restaurantInLimit(this.fullbenchmarks[j].restaurant_lat,
              this.fullbenchmarks[j].restaurant_lng,
              this.restaurants[this.benchmark_index].restaurant_lat,
              this.restaurants[this.benchmark_index].restaurant_lng, 20)) {
            included = false;
          }
          break;
        }
      }
      if (included) {
        switch (this.cuisineDataSelection.index) {
          case 1: { // Cuisine
            if (this.fullbenchmarks[j].restaurant_cuisine_1 !==
              this.restaurants[this.benchmark_index].restaurant_cuisine_1) {
              included = false;
            }
            break;
          }
        }
      }
      if (included) {
        switch (this.groupDataSelection.index) {
          case 1: { // Cuisine
            if (this.fullbenchmarks[j].restaurant_group_name !==
              this.restaurants[this.benchmark_index].restaurant_group_name) {
              included = false;
            }
            break;
          }
        }
      }
      // add this one to the set, checking to see whether we should exclude the current one
      if (this.include_restaurant) {
        if (included) {
          this.benchmarks.push(this.fullbenchmarks[j]);
        }
      } else {
        if (included && this.restaurants[this.benchmark_index].restaurant_id !==
          this.fullbenchmarks[j].restaurant_id) {
          this.benchmarks.push(this.fullbenchmarks[j]);
        }
      }

    }
    this.benchmarks_length = this.benchmarks.length;
    this.countRestaurants();
    this.showData();
  }

  restaurantInLimit(lat1, lng1, lat2, lng2, limit) {
    // return true if if the distance between the two GPS points is within the limit in km
    // check for the same point to prevent division by zero
    if (lat1 === lat2 && lng1 === lng2) {
      return true;
    } else {
      const conv = 57.29577951;
      const rad_lat1 = lat1 / conv;
      const rad_lng1 = lng1 / conv;
      const rad_lat2 = lat2 / conv;
      const rad_lng2 = lng2 / conv;
      // great circle formula
      const distance = Math.acos(Math.sin(rad_lng1) * Math.sin(rad_lng2) +
        Math.cos(rad_lng1) * Math.cos(rad_lng2) * Math.cos(rad_lat1 - rad_lat2)) * 6371;
      // console.log(lat1, lng1, lat2, lng2, limit, distance);
      return (distance <= limit);
    }
  }

  // This cloned and adapted from the Google-Charts component
  drawGraph(chartData, chartOptions, chartElement, chartType) {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);
    const self = this;
    // drawChart();
    function drawChart() {
      let chart;
      const chart_div = document.getElementById(chartElement);
      if (chartType === 'line') {
        chartOptions.seriesType = 'line';
        chart = new google.visualization.LineChart(chart_div);
      } else {
        chartOptions.seriesType = 'candlesticks';
        // console.log(JSON.stringify(chartData));
        chart = new google.visualization.ComboChart(chart_div);
      }
      // Wait for the chart to finish drawing before calling the getImageURI() method.
      google.visualization.events.addListener(chart, 'ready', function () {
        localStorage.setItem('png_save', chart.getImageURI());
      });
      google.visualization.events.addListener(chart, 'select', function() {
        const row = chart.getSelection()[0].row;
        self.showToolTip(row);
      });
      // console.log('in draw', chartOptions.title);
      chart.draw(chartData, chartOptions);
    }
  }

  public showToolTip (index) {
    // console.log('You selected ' + index, this.graph_texts[index]);
    this.openSnackBar(this.graph_texts[index], '');
  }

  drawSubGraph(chartData, chartOptions, chartElement, chartType) {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);
    // drawChart();
    function drawChart() {
      let chart;
      const chart_div = document.getElementById(chartElement);
      if (chartType === 'line') {
        chartOptions.seriesType = 'line';
        chart = new google.visualization.LineChart(chart_div);
      } else {
        chartOptions.seriesType = 'candlesticks';
        // console.log(JSON.stringify(chartData));
        chart = new google.visualization.ComboChart(chart_div);
      }
      // console.log('in sub draw', chartOptions.title);
      chart.draw(chartData, chartOptions);
    }
  }

  showData() {
    // plot the data in array plotRestaurants
    // console.log('review', this.review);
    if (this.review) {
      // THIS IS THE REVIEW OPTION
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
                if (i === this.plotRestaurants.length - 1) {
                  // have all the data now, so can proceed to assemble plot
                  this.setGraphData(this.master_plot_index);
                  this.setSubCharts();
                  // console.log('subplots are', this.sub_plot_index);
                }
              }
            });
      }
    } else {
      // THIS IS THE BENCHMARKING OPTION
      // console.log('benchmarking master');
      this.setBenchmarkData();
      this.setSubCharts();
      let i = 0;
      for (let j = 0; j < this.graphDataOptions.length; j++) {
        if (j !== this.master_plot_index) {
          this.setBenchmarkSubData(i, this.graphDataOptions[j].label + ' ' + this.graphDataOptions[j].units,
            this.graphDataOptions[j].dataSource1, this.graphDataOptions[j].dataSource2);
          this.sub_plot_index[i] = j;
          i++;
        }
      }
    }
  }

  setBenchmarkData() {
    // first deal with the main chart
    this.line_ChartHeading = this.graphDataOptions[this.master_plot_index].label + ' ' +
      this.graphDataOptions[this.master_plot_index].units;
    this.line_ChartOptions['vAxis'] = {
      title: this.graphDataOptions[this.master_plot_index].label + ' ' +
        this.graphDataOptions[this.master_plot_index].units,
      titleTextStyle : {
        fontSize: 16
      }
    };
    // we should have all the required benchmarking data already assembled
    // note that fullbenchmarks also has the data for the restaurant being benchmarked
    let year_start = 3000;
    let year_end = 1000;
    for (let i = 0; i < this.fullbenchmarks.length; i++) {
      if (this.fullbenchmarks[i].restaurant_id === this.restaurants[this.benchmark_index].restaurant_id) {
        if (Number(this.fullbenchmarks[i].financial_year_end) < year_start) {
          year_start = Number(this.fullbenchmarks[i].financial_year_end);
        }
        if (Number(this.fullbenchmarks[i].financial_year_end) > year_end) {
          year_end = Number(this.fullbenchmarks[i].financial_year_end);
        }
      }
    }
    // console.log(year_start, year_end);
    this.line_ChartData = new google.visualization.DataTable();
    this.line_ChartData.addColumn('string', 'Year');
    // setting up for two candlestick plots
    this.line_ChartData.addColumn('number', 'Group');
    this.line_ChartData.addColumn('number', 'C2');
    this.line_ChartData.addColumn('number', 'C3');
    this.line_ChartData.addColumn('number', 'C4');
    this.line_ChartData.addColumn({type: 'string', role: 'tooltip'});
    this.line_ChartData.addColumn('number', this.restaurants[this.benchmark_index].restaurant_name);
    this.line_ChartData.addColumn('number', 'C2');
    this.line_ChartData.addColumn('number', 'C3');
    this.line_ChartData.addColumn('number', 'C4');
    this.line_ChartData.addColumn({type: 'string', role: 'tooltip'});
    // now add the rows - need to do this dynamically since we don't know how many column values
    const year_min: number[] = [];
    const year_max: number[] = [];
    const year_val: number[] = [];
    const year_text: string[] = [];
    const year_counter: number[] = [];
    const rank_text: string[] = [];
    const rank_set: number[] = [];
    let my_value = 0;
    let my_index = 0;
    for (let i = year_start; i <= year_end; i++) {
      year_min.push(1000000);
      year_max.push(-1000000);
      year_val.push(0);
      year_text.push('');
      year_counter.push(0);
      rank_text.push('');
      // find the value for this restaurant
      for (let j = 0; j < this.fullbenchmarks.length; j++) {
        if (i === Number(this.fullbenchmarks[j].financial_year_end) &&
          this.fullbenchmarks[j].restaurant_id === this.restaurants[this.benchmark_index].restaurant_id) {
          if (this.graphDataOptions[this.master_plot_index].dataSource2 === '') {
            year_val[my_index] =
              Number(this.fullbenchmarks[j][this.graphDataOptions[this.master_plot_index].dataSource1]);
            year_text[my_index] = this.fullbenchmarks[j][this.graphDataOptions[this.master_plot_index].dataSource1];
          } else {
            year_val[my_index] =
              (Number(this.fullbenchmarks[j][this.graphDataOptions[this.master_plot_index].dataSource1]) /
                Number(this.fullbenchmarks[j][this.graphDataOptions[this.master_plot_index].dataSource2]) * 100);
            year_text[my_index] = year_val[my_index].toFixed(2);

          }
        }
      }
      // now set the values for the cluster
      rank_set.length = 0;
      for (let j = 0; j < this.benchmarks.length; j++) {
        if (i === Number(this.benchmarks[j].financial_year_end)) {
          if (this.graphDataOptions[this.master_plot_index].dataSource2 === '') {
            my_value = Number(this.benchmarks[j][this.graphDataOptions[this.master_plot_index].dataSource1]);
          } else {
            my_value = (Number(this.benchmarks[j][this.graphDataOptions[this.master_plot_index].dataSource1]) /
              Number(this.benchmarks[j][this.graphDataOptions[this.master_plot_index].dataSource2]) * 100);
          }
          rank_set.push(my_value);
          year_counter[my_index]++;
          if (my_value < year_min[my_index]) {
            year_min[my_index] = my_value;
          }
          if (my_value > year_max[my_index]) {
            year_max[my_index] = my_value;
          }
        }
      }
      // and finally set up the ranking - sort the array DESCENDING first, remembering they are NUMBERS!
      rank_set.sort(function (a, b) {
        return b - a;
      });
      // console.log(JSON.stringify(rank_set));
      let my_rank = -1;
      for (let j = 0; j < rank_set.length; j++) {
        if (year_val[my_index] >= rank_set[j]) {
          my_rank = j + 1;
          break;
        }
      }
      // catch the instance where the rank falls off the end of the list
      if (my_rank === -1) {
        my_rank = rank_set.length;
      }
      // set up a proper text to reflect the ranking
      switch (my_rank) {
        case 1: {
          rank_text[my_index] = '1st';
          break;
        }
        case 2: {
          rank_text[my_index] = '2nd';
          break;
        }
        case 3: {
          rank_text[my_index] = '3rd';
          break;
        }
        default: {
          rank_text[my_index] = my_rank + 'th';
        }
      }
      my_index++;
    }
    // assemble the row
    my_index = 0;
    this.graph_texts.length = 0;
    for (let i = year_start; i <= year_end; i++) {
      const row = [];
      row.push(i.toString());
      // double values since we don't need whiskers
      row.push(year_min[my_index]);
      row.push(year_min[my_index]);
      row.push(year_max[my_index]);
      row.push(year_max[my_index]);
      // add a custom tooltip
      row.push('Range ' + year_min[my_index].toFixed(2) + ' to ' +
        year_max[my_index].toFixed(2));
      // replicating the value for the candlestick so we get a bar
      row.push(year_val[my_index]);
      row.push(year_val[my_index]);
      row.push(year_val[my_index]);
      row.push(year_val[my_index]);
      const percentile = (year_val[my_index] - year_min[my_index]) /
        (year_max[my_index] - year_min[my_index]) * 100;
      const percentile_string = percentile.toFixed(0);
      let percentile_text;
      // temporary fudge to get this working, will refine later
      switch (percentile_string) {
        case '1':
        case '21':
        case '31':
        case '41':
        case '51':
        case '61':
        case '71':
        case '81':
        case '91': {
          percentile_text = percentile_string + 'st';
          break;
        }
        case '2':
        case '22':
        case '32':
        case '42':
        case '52':
        case '62':
        case '72':
        case '82':
        case '92': {
          percentile_text = percentile_string + 'nd';
          break;
        }
        case '3':
        case '23':
        case '33':
        case '43':
        case '53':
        case '63':
        case '73':
        case '83':
        case '93': {
          percentile_text = percentile_string + 'rd';
          break;
        }
        default: {
          percentile_text = percentile_string + 'th';
        }
      }
      // add a custom tooltip
      let my_text;
      if (this.include_restaurant) {
         my_text = this.restaurants[this.benchmark_index].restaurant_name + ' (' +
          year_text[my_index] + ') is at the ' + percentile_text + ' percentile, ' +
          ' and is ranked ' + rank_text[my_index] + ' of ' + year_counter[my_index];
      } else {
        my_text = this.restaurants[this.benchmark_index].restaurant_name + ' (' +
          year_text[my_index] + ') would be at the ' + percentile_text + ' percentile, ' +
          ' and would be ranked ' + rank_text[my_index] + ' of ' + (Number(year_counter[my_index]) + 1);
      }
      this.graph_texts.push(my_text);
      // console.log(this.graph_texts[my_index]);
      row.push(my_text);
      this.line_ChartData.addRow(row);
      my_index++;
    }
    this.drawGraph(this.line_ChartData, this.line_ChartOptions,
      'benchmark_chart', 'candlesticks');
  }

  setBenchmarkSubData(index, header, dataSource1, dataSource2) {
    // first deal with the main chart
    this.line_sub_ChartOptions[index].title = header;
    this.line_sub_ChartOptions[index]['vAxis'] = {
      title: header,
      titleTextStyle : {
        fontSize: 8
      }
    };
    // we should have all the required benchmarking data already assembled
    // note that fullbenchmarks also has the data for the restaurant being benchmarked
    let year_start = 3000;
    let year_end = 1000;
    for (let i = 0; i < this.fullbenchmarks.length; i++) {
      if (this.fullbenchmarks[i].restaurant_id === this.restaurants[this.benchmark_index].restaurant_id) {
        if (Number(this.fullbenchmarks[i].financial_year_end) < year_start) {
          year_start = Number(this.fullbenchmarks[i].financial_year_end);
        }
        if (Number(this.fullbenchmarks[i].financial_year_end) > year_end) {
          year_end = Number(this.fullbenchmarks[i].financial_year_end);
        }
      }
    }
    // console.log(year_start, year_end);
    this.line_sub_ChartData[index] = new google.visualization.DataTable();
    this.line_sub_ChartData[index].addColumn('string', 'Year');
    // setting up for two candlestick plots
    this.line_sub_ChartData[index].addColumn('number', 'Group');
    this.line_sub_ChartData[index].addColumn('number', 'C2');
    this.line_sub_ChartData[index].addColumn('number', 'C3');
    this.line_sub_ChartData[index].addColumn('number', 'C4');
    this.line_sub_ChartData[index].addColumn({type: 'string', role: 'tooltip'});
    this.line_sub_ChartData[index].addColumn('number', this.restaurants[this.benchmark_index].restaurant_name);
    this.line_sub_ChartData[index].addColumn('number', 'C2');
    this.line_sub_ChartData[index].addColumn('number', 'C3');
    this.line_sub_ChartData[index].addColumn('number', 'C4');
    this.line_sub_ChartData[index].addColumn({type: 'string', role: 'tooltip'});
    // now add the rows - need to do this dynamically since we don't know how many column values
    const year_min: number[] = [];
    const year_max: number[] = [];
    const year_tot: number[] = [];
    const year_text: string[] = [];
    let my_value = 0;
    let my_index = 0;
    let my_counter = 0;
    for (let i = year_start; i <= year_end; i++) {
      year_min.push(1000000);
      year_max.push(-1000000);
      year_tot.push(0);
      my_counter = 0;
      for (let j = 0; j < this.benchmarks.length; j++) {
        if (i === Number(this.benchmarks[j].financial_year_end)) {
          if (dataSource2 === '') {
            my_value = Number(this.benchmarks[j][dataSource1]);
            year_text[my_index] = my_value.toString();

          } else {
            my_value = (Number(this.benchmarks[j][dataSource1]) /
              Number(this.benchmarks[j][dataSource2]) * 100);
            year_text[my_index] = my_value.toFixed(2);
          }
          year_tot[my_index] = year_tot[my_index] + my_value;
          my_counter++;
          if (my_value < year_min[my_index]) {
            year_min[my_index] = my_value;
          }
          if (my_value > year_max[my_index]) {
            year_max[my_index] = my_value;
          }
        }
      }
      year_tot[my_index] = year_tot[my_index] / my_counter;
      my_index++;
    }
    // assemble the row
    my_index = 0;
    for (let i = year_start; i <= year_end; i++) {
      const row = [];
      row.push(i.toString());
      // double values since we don't need whiskers
      row.push(year_min[my_index]);
      row.push(year_min[my_index]);
      row.push(year_max[my_index]);
      row.push(year_max[my_index]);
      row.push('Range ' + year_min[my_index].toFixed(2) + ' to ' +
        year_max[my_index].toFixed(2));
      // replicating the average for the candlestick so we get a bar
      row.push(year_tot[my_index]);
      row.push(year_tot[my_index]);
      row.push(year_tot[my_index]);
      row.push(year_tot[my_index]);
      row.push(this.restaurants[this.benchmark_index].restaurant_name + ' (' +
        year_text[my_index] + ')' );
      this.line_sub_ChartData[index].addRow(row);
      my_index++;
    }
    const my_options = JSON.parse(JSON.stringify(this.line_sub_ChartOptions[index]));
    this.drawSubGraph(this.line_sub_ChartData[index], my_options,
      'sub_chart_' + index, 'candlesticks');
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

    // allow for the data to be shown as grouped
    if (this.view_group) {
      // THIS IS THE GROUPED CHART
      this.line_ChartData = new google.visualization.DataTable();
      this.line_ChartData.addColumn('string', 'Year');
      // setting up for two candlestick plots
      this.line_ChartData.addColumn('number', 'Range');
      this.line_ChartData.addColumn('number', 'C2');
      this.line_ChartData.addColumn('number', 'C3');
      this.line_ChartData.addColumn('number', 'C4');
      this.line_ChartData.addColumn({type: 'string', role: 'tooltip'});
      this.line_ChartData.addColumn('number', 'Average');
      this.line_ChartData.addColumn('number', 'C2');
      this.line_ChartData.addColumn('number', 'C3');
      this.line_ChartData.addColumn('number', 'C4');
      this.line_ChartData.addColumn({type: 'string', role: 'tooltip'});

      // now add the rows - need to do this dynamically since we don't know how many column values
      const year_min: number[] = [];
      const year_max: number[] = [];
      const year_tot: number[] = [];
      let my_value = 0;
      let my_index = 0;
      for (let i = year_start; i <= year_end; i++) {
        year_min.push(1000000);
        year_max.push(-1000000);
        year_tot.push(0);
        for (let j = 0; j < this.plotRestaurants.length; j++) {
          for (let k = 0; k < this.financials.length; k++) {
            if (i === Number(this.financials[k].data.financial_year_end) &&
              this.financials[k].name === this.plotRestaurants[j].restaurant_name) {
              if (dataSource2 === '') {
                my_value = Number(this.financials[k].data[dataSource1]);
              } else {
                my_value = (Number(this.financials[k].data[dataSource1] /
                  Number(this.financials[k].data[dataSource2]) * 100));
              }
              year_tot[my_index] = year_tot[my_index] + my_value;
              if (my_value < year_min[my_index]) {
                year_min[my_index] = my_value;
              }
              if (my_value > year_max[my_index]) {
                year_max[my_index] = my_value;
              }
            }
          }
        }
        year_tot[my_index] = year_tot[my_index] / this.plotRestaurants.length;
        my_index++;
      }
      // assemble the row
      my_index = 0;
      this.graph_texts.length = 0;
      for (let i = year_start; i <= year_end; i++) {
        const row = [];
        row.push(i.toString());
        // double values since we don't need whiskers
        row.push(year_min[my_index]);
        row.push(year_min[my_index]);
        row.push(year_max[my_index]);
        row.push(year_max[my_index]);
        row.push('Range ' + year_min[my_index].toFixed(2) + ' to '
          + year_max[my_index].toFixed(2));
        // replicating the average for the candlestick so we get a bar
        row.push(year_tot[my_index]);
        row.push(year_tot[my_index]);
        row.push(year_tot[my_index]);
        row.push(year_tot[my_index]);
        row.push('Average ' + year_tot[my_index].toFixed(2));
        this.graph_texts.push(i + ': Range ' + year_min[my_index].toFixed(2) + ' to '
          + year_max[my_index].toFixed(2) + ', Average ' + year_tot[my_index].toFixed(2));
        this.line_ChartData.addRow(row);
        my_index++;
      }
      // console.log(JSON.stringify(this.line_ChartData));
      this.drawGraph(this.line_ChartData, this.line_ChartOptions, 'benchmark_chart', 'area');

    } else {
      // THIS IS THE NON-GROUPED LINE CHART
      this.line_ChartData = new google.visualization.DataTable();
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
        // seems to me that we might arrive here not having pushed the right number of rows (i.e. years)
        // if we did not choose the data sets accordingly (i.e. what if there is a missing value?)
        console.log('row length ' + row.length);
        this.line_ChartData.addRow(row);
      }
      // console.log(JSON.stringify(this.line_ChartData));
      this.drawGraph(this.line_ChartData, this.line_ChartOptions, 'benchmark_chart', 'line');
    }

  }

  setsubArrays(index, label, header, dataSource1, dataSource2) {
    // this routine now also handles two datasources, just checks for dataSource2 === ''
    // see definition of data structure in ngInit
    // console.log(index, header, dataSource1, dataSource2);
    // console.log(index, label);
    this.line_sub_ChartOptions[index].title = header;
    this.line_sub_ChartOptions[index]['vAxis'] = {
      title: header,
      titleTextStyle : {
        fontSize: 8
      }
    };

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

    if (this.view_group) {
      // THIS IS THE GROUPED CHART
      this.line_sub_ChartData[index] = new google.visualization.DataTable();
      this.line_sub_ChartData[index].addColumn('string', 'Year');
      // setting up for two candlestick plots
      this.line_sub_ChartData[index].addColumn('number', 'Range');
      this.line_sub_ChartData[index].addColumn('number', 'C2');
      this.line_sub_ChartData[index].addColumn('number', 'C3');
      this.line_sub_ChartData[index].addColumn('number', 'C4');
      this.line_sub_ChartData[index].addColumn({type: 'string', role: 'tooltip'});
      this.line_sub_ChartData[index].addColumn('number', 'Average');
      this.line_sub_ChartData[index].addColumn('number', 'C2');
      this.line_sub_ChartData[index].addColumn('number', 'C3');
      this.line_sub_ChartData[index].addColumn('number', 'C4');
      this.line_sub_ChartData[index].addColumn({type: 'string', role: 'tooltip'});

      // now add the rows - need to do this dynamically since we don't know how many column values
      const year_min: number[] = [];
      const year_max: number[] = [];
      const year_tot: number[] = [];
      let my_value = 0;
      let my_index = 0;
      for (let i = year_start; i <= year_end; i++) {
        year_min.push(1000000);
        year_max.push(-1000000);
        year_tot.push(0);
        for (let j = 0; j < this.plotRestaurants.length; j++) {
          for (let k = 0; k < this.financials.length; k++) {
            if (i === Number(this.financials[k].data.financial_year_end) &&
              this.financials[k].name === this.plotRestaurants[j].restaurant_name) {
              if (dataSource2 === '') {
                my_value = Number(this.financials[k].data[dataSource1]);
              } else {
                my_value = (Number(this.financials[k].data[dataSource1] /
                  Number(this.financials[k].data[dataSource2]) * 100));
              }
              year_tot[my_index] = year_tot[my_index] + my_value;
              if (my_value < year_min[my_index]) {
                year_min[my_index] = my_value;
              }
              if (my_value > year_max[my_index]) {
                year_max[my_index] = my_value;
              }
            }
          }
        }
        year_tot[my_index] = year_tot[my_index] / this.plotRestaurants.length;
        my_index++;
      }
      // assemble the row
      my_index = 0;
      for (let i = year_start; i <= year_end; i++) {
        const row = [];
        row.push(i.toString());
        // double values since we don't need whiskers
        row.push(year_min[my_index]);
        row.push(year_min[my_index]);
        row.push(year_max[my_index]);
        row.push(year_max[my_index]);
        row.push('Range ' + year_min[my_index].toFixed(2) + ' to ' + year_max[my_index].toFixed(2));
        // replicating the average for the candlestick so we get a bar
        row.push(year_tot[my_index]);
        row.push(year_tot[my_index]);
        row.push(year_tot[my_index]);
        row.push(year_tot[my_index]);
        row.push('Average ' + year_tot[my_index].toFixed(2));
        this.line_sub_ChartData[index].addRow(row);
        my_index++;
      }
      // console.log(JSON.stringify(this.line_ChartData));
      const my_options = JSON.parse(JSON.stringify(this.line_sub_ChartOptions[index]));

      this.drawSubGraph(this.line_sub_ChartData[index], my_options,
        'sub_chart_' + index, 'area');

    } else {
      // THIS IS THE NON-GROUPED CHART
      this.line_sub_ChartData[index] = new google.visualization.DataTable();
      this.line_sub_ChartData[index].addColumn('string', 'Year');
      // all other columns are of type 'number'.
      for (let i = 0; i < this.plotRestaurants.length; i++) {
        this.line_sub_ChartData[index].addColumn('number', this.plotRestaurants[i].restaurant_name);
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
        this.line_sub_ChartData[index].addRow(row);
      }
      // console.log(JSON.stringify(this.line_sub_ChartData[index]));
      // console.log(JSON.stringify(this.line_sub_ChartOptions[index]));
      // console.log(this.line_sub_ChartOptions[index].title);

      // create a separate object for the chart
      const my_options = JSON.parse(JSON.stringify(this.line_sub_ChartOptions[index]));

      this.drawSubGraph(this.line_sub_ChartData[index], my_options,
        'sub_chart_' + index, 'line');
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

}
