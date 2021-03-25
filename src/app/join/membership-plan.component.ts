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
    this.originalPlan = this.selectedPlan = this.getPlan(this.products[0].product_id);

    // get the current period m/y to set the tab
    this.selectedTabIndex = this.originalPlan.product_period === 'm'? 0 : 1;

    // set the subscription period
    this.selectedPeriod = this.originalPlan.product_period;

    // split products into monthly/yearly
    this.plans.monthly = this.data.products.filter(obj => obj.product_period === 'm');
    this.plans.yearly = this.data.products.filter(obj => obj.product_period === 'y');

    // set default text
    this.updatePlanInstructions(this.selectedPlan.product_period);

  }

  updatePlanInstructions(period: string): void {

      // new plans
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
            price: this.currencyPipe.transform(this.selectedPlan.product_price, this.data.currencyCode)
          });
      } else {
        this.planInstructions = this.translate.instant(
          'PLANS.infoCurrentPlanYearly',
          {
            plan: this.selectedPlan.product_name.trim(),
            renewal: this.renewalDate,
            price: this.currencyPipe.transform(this.selectedPlan.product_price, this.data.currencyCode)
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

  getProrate(): string {
    let oneDay, now, then, daysToRenewal, dayRate;
    oneDay = (1000*60*60*24);
    now = new Date().getTime();
    then = new Date(this.renewalDate).getTime();
    // Get whole days
    daysToRenewal = Math.ceil((then - now) / oneDay );
    // Calculate day rates
    if (this.selectedPeriod === 'm') {
      dayRate = (this.selectedPlan.product_price * 12) / 365;
    } else {
      dayRate = this.selectedPlan.product_price / 365;
    }
    return this.currencyPipe.transform((daysToRenewal * dayRate), this.data.currencyCode);
  }

  ordinate(n: number, keepNumber: boolean = true) {
    const ordinals: string[] = ['th','st','nd','rd'];
    let v = n % 100;
    return ( keepNumber? n:'') + ( ordinals[(v-20)%10] || ordinals[v] || ordinals[0] );
  }

  upgradePlan(){
    this.dialog.close({
      productId: this.selectedPlan.stripe_product_id
    });
  }

}
