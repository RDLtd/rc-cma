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
      image: this.event.image,
      title: this.event.offer_tag,
      subtitle: this.event.offer_strapline,
      description: this.event.offer_text,
      link: this.event.offer_link,
      eventStart: this.event.offer_from,
      eventEnd: this.event.offer_to,
      marketingStart: this.event.offer_marketed_from,
      marketingEnd: this.event.offer_marketed_to,
      channel: this.event.offer_channel_id,
      id: this.event.offer_id
    });
  }

  addEventDate(control: string, event: MatDatepickerInputEvent<Date>): void {
    console.log(control, event);
  }

  imageUploadHandler(url: string): void {
    console.log('Update image to:', url);
    this.eventFormGroup.patchValue({image: url});
    this.imgUrl = url;
  }

  updateEvent(): void {
    const event = this.mapEventOffer();
    this.dialogRef.close(event);
    //console.log(this.eventFormGroup.value);
  }

  mapEventOffer(): Object {
    let c = this.eventFormGroup.controls;
    return {
      offer_id: c.id.value,
      offer_channel_id: c.channel.value,
      offer_updated: '',
      offer_category: c.category.value,
      offer_tag: c.title.value,
      offer_strapline: c.subtitle.value,
      offer_text: c.description.value,
      offer_link: c.link.value,
      offer_from: c.eventStart.value,
      offer_to: c.eventEnd.value,
      offer_marketed_from: c.marketingStart.value,
      offer_marketed_to: c.marketingEnd.value,
    };
  }

}
