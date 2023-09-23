import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'rc-event-form',
  templateUrl: './event-form.component.html',
  styles: [
  ]
})
export class EventFormComponent implements OnInit {

  eventFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.initEventForm();
  }

  initEventForm(): void {
    this.eventFormGroup = this.fb.group({
      title: 'This is the title'
    });
  }

}
