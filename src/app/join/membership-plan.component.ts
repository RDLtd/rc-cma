import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'rc-membership-plan',
  templateUrl: './membership-plan.component.html'
})

export class MembershipPlanComponent implements OnInit {

  selectedOptions = [this.data.currentPlanId];
  selectedTab: number;
  originalPlan: any;
  selectedPlan: any;
  planInstructions: string;
  planChanged = false;
  products = this.data.products;
  plans = {
    monthly: [],
    yearly: []
  }

  constructor(
    private currencyPipe: CurrencyPipe,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    // cache the current product
    this.originalPlan = this.selectedPlan = this.getPlan(this.products[0].product_id);
    // get the current period m/y to set the tab
    this.selectedTab = this.originalPlan.product_period === 'm'? 0 : 1;
    // split products into monthly/yearly
    this.plans.monthly = this.data.products.filter(obj => obj.product_period === 'm');
    this.plans.yearly = this.data.products.filter(obj => obj.product_period === 'y');
    // set default text
    this.planInstructions = this.translate.instant(
      'PLANS.infoCurrentPlan',
      {
        renewal: this.ordinate(19),
        price: this.currencyPipe.transform(this.selectedPlan.product_price, 'GBP') });
  }

  getPlan(id): any {
    return this.products.find(p => p.product_id === id);
  }

  isCurrentPlan(id): boolean {
    return id === this.originalPlan.product_id;
  }

  selectPlan(id) {
    this.planChanged = id !== this.originalPlan.product_id;
    this.selectedPlan = this.getPlan(id);
    if (this.planChanged) {
      this.planInstructions = this.translate.instant(
        'PLANS.infoNewPlan',
        {
          plan: this.selectedPlan.product_name,
          renewal: this.ordinate(19),
          price: this.currencyPipe.transform(this.selectedPlan.product_price, this.data.currencyCode)
        });
    } else {
      this.planInstructions = this.translate.instant(
        'PLANS.infoCurrentPlan',
        {
          renewal: this.ordinate(19),
          price: this.currencyPipe.transform(this.selectedPlan.product_price, this.data.currencyCode)
        })
    }
  }

  ordinate(n: number, keepNumber: boolean = true) {
    const ordinals: string[] = ['th','st','nd','rd'];
    let v = n % 100;
    return ( keepNumber? n:'') + ( ordinals[(v-20)%10] || ordinals[v] || ordinals[0] );
  }

}
