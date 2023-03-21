import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'rc-cms-spw-builder',
  templateUrl: './cms-spw-builder.component.html',
  styles: [
  ]
})
export class CmsSpwBuilderComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }

}
