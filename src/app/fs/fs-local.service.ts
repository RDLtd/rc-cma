import { Injectable } from '@angular/core';
import { Restaurant } from '../_models';
import { Observable, Subject, BehaviorSubject } from 'rxjs'
import { MatSnackBar } from '@angular/material';

@Injectable()

export class FsLocalService {

  private restaurants: Array<Restaurant> = [];
  private subject: Subject<any> = new BehaviorSubject<any>(this.restaurants);
  private graphOptions: Array<any> = [
    {
      index: 0, label: 'Turnover', units: '(£ 000s)',
      dataSource1: 'financial_turnover', dataSource2: '',
      section: 'Profit and Loss'
    },
    {
      index: 1, label: 'Gross Profit', units: '(£ 000s)',
      dataSource1: 'financial_gross_profit', dataSource2: ''
    },
    {
      index: 2, label: 'Administration Costs', units: '(£ 000s)',
      dataSource1: 'financial_admin_costs', dataSource2: ''
    },
    {
      index: 3, label: 'Profit Before Tax', units: '(£ 000s)',
      dataSource1: 'financial_profit_before_tax', dataSource2: ''
    }];

  constructor(
    private snackBar: MatSnackBar
  ) { }

  setRestaurants(restaurants): void {
    this.restaurants = restaurants;
    console.log('Set', this.restaurants);
    this.subject.next(this.restaurants);
  }

  getRestaurants(): Observable<any> {
    return this.subject.asObservable();
  }

  setGraphOptions(options){
    this.graphOptions = options;
  }

  getGraphOptions() {
    return this.graphOptions;
  }

}
