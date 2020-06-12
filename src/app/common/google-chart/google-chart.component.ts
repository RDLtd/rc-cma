import { Directive, ElementRef, Input, OnInit } from '@angular/core';

declare var google: any;
declare var googleLoaded: any;

@Directive({
  selector: '[GoogleChart]'
})

export class GoogleChartComponent implements OnInit {

  public _element: any;
  @Input('chartType') public chartType: string;
  @Input('chartOptions') public chartOptions: Object;
  @Input('chartData') public chartData: Object;

  constructor(public element: ElementRef) {
    this._element = this.element.nativeElement;
  }

  ngOnInit() {

    setTimeout(() => {
        google.charts.load('current', { 'packages': ['corechart'] });
        // this.drawGraph(this.chartOptions, this.chartType, this.chartData, this._element);
        google.charts.load('current', { packages:['calendar'] });
        google.charts.setOnLoadCallback(this.drawGraph(this.chartOptions, this.chartType, this.chartData, this._element));
      }, 10000);
  }

  drawGraph(chartOptions, chartType, chartData, ele) {
    // console.log(chartType, chartData, chartOptions, ele.id);
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
      const wrapper = new google.visualization.ChartWrapper({
        chartType: chartType,
        dataTable: chartData,
        options: chartOptions || {},
        containerId: ele.id
      });
      wrapper.draw();
    }
  }
}
