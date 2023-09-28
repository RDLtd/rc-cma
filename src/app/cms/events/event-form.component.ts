import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { Observable } from 'rxjs';
import { ConfirmCancelComponent } from '../../common';

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
  imgUrl = null;
  offerCategory = null;

  formLabel: string;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.event = this.data.event;
    this.categories$ = this.data.categories;
    this.formLabel = this.data.formLabel;
    this.restaurant = this.data.restaurant;
  }

  ngOnInit() {

    this.initEventForm();

  }

  initEventForm(): void {
    console.log('initEventForm', this.event);
    //this.imgUrl = this.event.offer_image;

    this.offerCategory = this.event.offer_category;

    this.eventFormGroup = this.fb.group({
      category: [this.event.offer_category, [Validators.required]],
      catKey: [this.event.offer_key],
      image: [this.event.offer_image],
      title: [this.event.offer_tag, [Validators.required]],
      subtitle: this.event.offer_strapline,
      description: [this.event.offer_text, [Validators.required]],
      link: this.event.offer_link,
      eventStart: [this.event.offer_from, [Validators.required]],
      eventEnd: [this.event.offer_to, [Validators.required]],
      marketingStart: [this.event.offer_marketed_from, [Validators.required]],
      marketingEnd: [this.event.offer_marketed_to, [Validators.required]],
      channel: this.event.offer_channel_id,
      id: this.event.offer_id
    });
    // If no event category has been selected, or this is a new event
    // set a default category
    if (this.event.offer_image === undefined) {
      console.log('Undefined category', this.event.offer_category);
      this.categories$.subscribe((cat) => {
        this.eventFormGroup.patchValue({category: cat[0]});
        this.imgUrl = cat[0].image;
      });
    } else {
      this.imgUrl = this.event.offer_image;
    }
  }

  addEventDate(control: string, event: MatDatepickerInputEvent<Date>): void {
    console.log(control, event);
  }

  deleteCustomImage(): void {
    console.log('Revert to default image');
    const catId = this.event.offer_key;
    this.categories$.subscribe({
      next: (cats) => {
        let defaultCategory = cats.find(elem => elem.id === catId);
        console.log(catId, defaultCategory);
        this.eventFormGroup.patchValue({ category: defaultCategory });
        this.eventFormGroup.patchValue({ image: defaultCategory.image });
        this.imgUrl = defaultCategory.image;
      }
    });
  }

  imageUploadHandler(url: string): void {
    console.log('Update image to:', url);
    let obj = Object.assign(this.eventFormGroup.controls.category.value, {image: 'custom'});
    console.log(obj);
    this.eventFormGroup.patchValue({category: obj});
    this.eventFormGroup.patchValue({image: url});
    this.imgUrl = url;
  }

  updateEventCategory(): void {
    console.log('loaded', this.offerCategory);
    console.log('now',this.eventFormGroup.controls.category.value);
    // If this event has had a custom image loaded
    // don't replace it.
    if(this.offerCategory.image === 'custom'){
      return;
    }
    this.imgUrl = this.eventFormGroup.controls.category.value.image;
    this.eventFormGroup.patchValue({image: this.imgUrl});
    this.eventFormGroup.patchValue({ catKey: this.eventFormGroup.controls.category.value.id})
  }

  updateEvent(): void {
    const event = this.mapEventOffer();
    this.dialogRef.close({ action: 'update', data: event });
    console.log(this.eventFormGroup.valid);
  }

  // Automatically set the marketing end date to now
  // and update the event.
  deactivateEvent(): void {
    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        title: "Are you sure?",
        body:
          "Once you deactivate this event it will no longer be visible on" +
          "your website, or via the Apptiser Network." +
          "You can reactivate at anytime by editing your Marketing Dates."
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      console.log(`Deactivate: ${confirmed}`);
      if(!confirmed) { return; }
      this.eventFormGroup.patchValue({ marketingEnd: new Date().toUTCString()});
      this.updateEvent();
    });
  }

  deleteEvent(): void {
    const dialogRef = this.dialog.open(ConfirmCancelComponent, {
      data: {
        body:
          "You are about to permanently DELETE this event, are you sure you want to continue?"
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      console.log(`Delete: ${confirmed}`);
      if(!confirmed) { return; }
      this.dialogRef.close({ action: 'delete', data: this.event.offer_id });
    });
  }

  mapEventOffer(): Object {
    let c = this.eventFormGroup.controls;
    return {
      offer_id: c.id.value,
      offer_channel_id: c.channel.value,
      offer_key: c.catKey.value,
      offer_updated: '',
      offer_category: c.category.value,
      offer_image: c.image.value,
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
