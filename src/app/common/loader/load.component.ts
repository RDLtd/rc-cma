import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'rc-load',
  templateUrl: './load.component.html'
})
export class LoadComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      message: string
    }
  ) { }

}
