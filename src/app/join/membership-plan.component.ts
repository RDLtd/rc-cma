import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'rc-membership-plan',
  templateUrl: './membership-plan.component.html'
})

export class MembershipPlanComponent implements OnInit {

  selectedOptions = [this.data.currentPlanId];
  selectedTabIndex: number;
  selectedPlan: any;
  selectedPeriod: any;
  originalPlan: any;
  renewalDay = this.data.renewal.getDate();
  renewalDate = this.data.renewal.toDateString();

  planInstructions: string;
  planChanged = false;
  products = this.data.products;
  plans = {
    monthly: [],
    yearly: []
  }

  constructor(
    private dialog: MatDialogRef<MembershipPlanComponent>,
    private currencyPipe: CurrencyPipe,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

    // cache the original product
    this.originalPlan = this.selectedPlan = this.getPlan(this.data.currentPlanId);

    // set the subscription period
    this.selectedPeriod = this.originalPlan.product_period;

    // get the current period m/y to set the tab
    this.selectedTabIndex = this.selectedPeriod === 'm'? 0 : 1;

    // split products into monthly/yearly arrays
    this.plans.monthly = this.data.products.filter(obj => obj.product_period === 'm');
    this.plans.yearly = this.data.products.filter(obj => obj.product_period === 'y');

    // set default text
    this.updatePlanInstructions(this.selectedPlan.product_period);

  }

  // Update dialog content based on current selection
  updatePlanInstructions(period: string): void {
    let monthly = this.selectedPeriod === 'm';
      // for new plans
    if (this.planChanged) {
      if (period === 'm') {
        this.planInstructions = this.translate.instant(
          'PLANS.infoNewPlanMonthly',
          {
            plan: this.selectedPlan.product_name.trim(),
            renewal: this.renewalDate,
            prorate: this.getProrate(),
            price: this.currencyPipe.transform(this.selectedPlan.product_price, this.data.currencyCode)
          });
      } else {
        this.planInstructions = this.translate.instant(
          'PLANS.infoNewPlanYearly',
          {
            plan: this.selectedPlan.product_name.trim(),
            renewal: this.renewalDate,
            prorate: this.getProrate(),
            price: this.currencyPipe.transform(this.selectedPlan.product_price, this.data.currencyCode)
          });
      }
    } else {
      // original plan
      if (period === 'm') {
        this.planInstructions = this.translate.instant(
          'PLANS.infoCurrentPlanMonthly',
          {
            plan: this.selectedPlan.product_name.trim(),
            renewal: this.ordinate(this.renewalDay),
            price: this.currencyPipe.transform(this.originalPlan.product_price, this.data.currencyCode)
          });
      } else {
        this.planInstructions = this.translate.instant(
          'PLANS.infoCurrentPlanYearly',
          {
            plan: this.selectedPlan.product_name.trim(),
            renewal: this.renewalDate,
            price: this.currencyPipe.transform(this.originalPlan.product_price, this.data.currencyCode)
          });
      }
    }
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
    this.updatePlanInstructions(this.selectedPlan.product_period);
  }

  // getProrata(): string {
  //   // ratio calculation for prorate amount
  //   // here just using example price and dates
  //   const product_price = 21.50;
  //   const today = new Date(2021, 4, 7).getTime();
  //   const period_start = new Date(2021, 3, 23).getTime();
  //   const period_end = new Date(2021, 4, 25).getTime();
  //   const fraction = (period_end - today) / (period_end - period_start);
  //   const price_to_pay = product_price * fraction;
  //   console.log(period_start, period_end, today, fraction, product_price, price_to_pay);
  // }

  getProrate(): string {
    let oneDay, now, renewal, daysToRenewal, dayRate, amountDue;
    oneDay = (1000*60*60*24);
    now = new Date().getTime();
    renewal = new Date(this.renewalDate).getTime();
    // Get whole days
    daysToRenewal = Math.floor((renewal - now) / oneDay );
    // Calculate day rates
    dayRate = this.selectedPeriod === 'm'? (this.selectedPlan.product_price * 12)/365 : this.selectedPlan.product_price / 365;
    console.log (`${daysToRenewal} days to renewal at ${dayRate} per day`);
    amountDue = (daysToRenewal * dayRate) - this.originalPlan.product_price;

    return this.currencyPipe.transform(amountDue, this.data.currencyCode);
  }

  ordinate(n: number, keepNumber: boolean = true) {
    const ordinals: string[] = ['th','st','nd','rd'];
    let v = n % 100;
    return ( keepNumber? n:'') + ( ordinals[(v-20)%10] || ordinals[v] || ordinals[0] );
  }

  upgradePlan(){
    console.log(this.selectedPlan);
    this.dialog.close({
      productId: this.selectedPlan.product_stripe_id,
      priceId: this.selectedPlan.product_stripe_price_id
    });
  }

}
