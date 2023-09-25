import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Event } from "./cms-events.component";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { Observable } from 'rxjs';
import { ImageComponent } from '../../settings';

@Component({
  selector: 'rc-event-form',
  templateUrl: './event-form.component.html',
  styles: [
  ]
})
export class EventFormComponent implements OnInit {

  eventFormGroup: FormGroup;
  event: any;
  categories$: Observable<any>

  formLabel: string;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    console.log(this.data);
    this.event = this.data.event;
    this.categories$ = this.data.categories;
    this.formLabel = this.data.formLabel;

  }

  ngOnInit() {
    this.initEventForm();
  }

  initEventForm(): void {
    this.eventFormGroup = this.fb.group({
      category: this.event.offer_category,
      imgPath: this.event.imgPath,
      title: this.event.offer_tag,
      subtitle: this.event.offer_strapline,
      description: this.event.offer_text,
      link: this.event.offer_link,
      eventStart: this.event.offer_from,
      eventEnd: this.event.offer_to,
      marketingStart: this.event.offer_marketed_from,
      marketingEnd: this.event.offer_marketed_to
    });
  }

  addEventDate(control: string, event: MatDatepickerInputEvent<Date>): void {
    console.log(control, event);
  }

  uploadNewImage(): void {
    let dialogConfig = {
      data: {
        imageType: 'event'
      }
    }
    const imageUpload = this.dialog.open(ImageComponent, dialogConfig);
  }

}
