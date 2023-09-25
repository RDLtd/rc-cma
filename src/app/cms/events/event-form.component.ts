import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Event } from "./cms-events.component";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";

@Component({
  selector: 'rc-event-form',
  templateUrl: './event-form.component.html',
  styles: [
  ]
})
export class EventFormComponent implements OnInit {

  eventFormGroup: FormGroup;
  event: Event;

  constructor(
    public dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    console.log(this.data);
    this.event = this.data.event;
  }

  ngOnInit() {
    this.initEventForm();
  }

  initEventForm(): void {
    this.eventFormGroup = this.fb.group({
      category: this.event.category,
      imgPath: this.event.imgPath,
      title: this.event.title,
      subtitle: this.event.subTitle,
      description: this.event.description,
      link: this.event.link,
      eventStart: this.event.dateRange.start,
      eventEnd: this.event.dateRange.end
    });
  }

  addEventDate(control: string, event: MatDatepickerInputEvent<Date>): void {
    console.log(control, event);
  }
}
