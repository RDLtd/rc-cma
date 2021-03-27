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

    const isDowngrading = Number(this.selectedPlan.product_price) < Number(this.originalPlan.product_price);

    let monthly = this.selectedPeriod === 'm';
      // for new plans

    if (this.planChanged) {

      if (isDowngrading) {
        this.planInstructions = this.translate.instant(
          'PLANS.infoDowngrading',
          {
            plan: this.selectedPlan.product_name.trim(),
            renewal: this.renewalDate,
            period: period,
            price: this.currencyPipe.transform(this.selectedPlan.product_price, this.data.currencyCode)
          });
        return;
      }

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

  exceedsPlan(allowance: number): boolean {
    return allowance < this.data.max;
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
    const oneHour = (1000*60*60);
    const now = new Date().getTime();
    const renewal = new Date(this.renewalDate).getTime();
    // Get hours left before scheduled renewal
    const hoursToRenewal = Math.ceil((renewal - now) / oneHour );
    // Calculate new and old hourly rates
    const newHourlyRate = this.selectedPeriod === 'm'? (this.selectedPlan.product_price * 12)/365/24 : this.selectedPlan.product_price /365/24;
    const oldHourlyRate = this.originalPlan.product_period === 'm'? (this.originalPlan.product_price * 12)/365/24 : this.originalPlan.product_price /365/24;
    const balanceDue = (hoursToRenewal * newHourlyRate) - (hoursToRenewal * oldHourlyRate);
    // console.log('Balance = ', this.currencyPipe.transform(balanceDue, this.data.currencyCode));
    return this.currencyPipe.transform(balanceDue, this.data.currencyCode);
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
