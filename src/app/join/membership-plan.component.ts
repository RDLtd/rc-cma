import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'rc-membership-plan',
  templateUrl: './membership-plan.component.html',
  styles: [
  ]
})
export class MembershipPlanComponent implements OnInit {

  selectedOptions = [1];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

}
