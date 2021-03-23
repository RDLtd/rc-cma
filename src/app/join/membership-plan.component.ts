import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'rc-membership-plan',
  templateUrl: './membership-plan.component.html',
  styles: [
  ]
})

export class MembershipPlanComponent implements OnInit {

  selectedOptions = [this.data.currentPlanId];
  originalPlan = this.data.currentPlanId;
  selectedPlan: any;
  planInstructions: string;
  planChanged = false;


  constructor(
    private currencyPipe: CurrencyPipe,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.selectedPlan = this.getPlan(this.originalPlan);
    this.planInstructions = this.translate.instant(
      'PLANS.infoCurrentPlan',
      {
        renewal: this.ordinate(this.selectedPlan.renewal),
        price: this.currencyPipe.transform(this.selectedPlan.price, 'GBP') });
  }

  getPlan(id): any {
    return this.data.plans.find(p => p.id === id);
  }

  selectPlan(id) {
    this.planChanged = id !== this.originalPlan;
    this.selectedPlan = this.getPlan(id);

    if (this.planChanged) {
      this.planInstructions = this.translate.instant(
        'PLANS.infoNewPlan',
        {
          plan: this.selectedPlan.name,
          renewal: this.ordinate(this.selectedPlan.renewal),
          price: this.currencyPipe.transform(this.selectedPlan.price, 'GBP')
        });
    } else {
      this.planInstructions = this.translate.instant(
        'PLANS.infoCurrentPlan',
        {
          renewal: this.ordinate(this.selectedPlan.renewal),
          price: this.currencyPipe.transform(this.selectedPlan.price, 'GBP')
        })
    }

  }



  ordinate(n: number, keepNumber: boolean = true) {
    const ordinals: string[] = ['th','st','nd','rd'];
    let v = n % 100;
    return ( keepNumber? n:'') + ( ordinals[(v-20)%10]||ordinals[v]||ordinals[0]);
  }


}
