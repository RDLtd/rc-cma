import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { Observable } from 'rxjs';

@Component({
  selector: 'rc-event-form',
  templateUrl: './event-form.component.html',
  styles: [
  ]
})
export class EventFormComponent implements OnInit {

  eventFormGroup: FormGroup;
  event: any;
  categories$: Observable<any>;
  restaurant: any;
  imgUrl = "https://ichef.bbci.co.uk/news/976/cpsprodpb/D0F5/production/_130939435_rwccup.jpg.webp";

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
    this.restaurant = this.data.restaurant;

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

  imageUploadHandler(url: string): void {
    console.log('Update image to:', url);
    this.eventFormGroup.patchValue({imgPath: url})
    this.imgUrl = url;
  }

  updateEvent(): void {
    console.log(this.eventFormGroup.value);
  }

}
