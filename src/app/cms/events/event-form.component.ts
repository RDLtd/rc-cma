import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { Observable } from 'rxjs';
import { ConfirmCancelComponent } from '../../common';
import { EventService } from './event.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'rc-event-form',
  templateUrl: './event-form.component.html',
  styles: [
  ]
})
export class EventFormComponent implements OnInit {

  eventFormGroup: FormGroup;
  event: any;
  isNewEvent: boolean | null;
  categories$: Observable<any>;
  restaurant: any;
  imgUrl = null;
  formLabel: string;
  arrCategories: any[];


  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private eventService: EventService
  ) {
    this.event = this.data.event;
    this.categories$ = this.data.categories;
    this.formLabel = this.data.formLabel;
    this.restaurant = this.data.restaurant;
    this.isNewEvent = this.data.new ?? false;
  }

  ngOnInit() {
    console.log('New Event', this.isNewEvent);
    this.arrCategories = this.eventService.getEventsArr();
    if (this.isNewEvent) {
      const dfCat = this.arrCategories[0];
      this.event = Object.assign(this.event, {
        offer_category: dfCat,
        offer_key: dfCat.id,
        offer_image: dfCat.image
      });
    }
    // console.log(this.event);
    this.initEventForm();

  }

  initEventForm(): void {

    //console.log('initEventForm', this.event);

    console.log('?', this.event.offer_category);

    this.eventFormGroup = this.fb.group({
      category: [this.event.offer_category.id, [Validators.required]],
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
      this.imgUrl = this.event.offer_category.image;
      this.eventFormGroup.patchValue({ category: this.imgUrl });
    } else {
      this.imgUrl = this.event.offer_image;
    }
  }

  addEventDate(control: string, event: MatDatepickerInputEvent<Date>): void {
    const inDate = event.value || 0;
    this.eventFormGroup.controls[control]
      .patchValue(formatDate(inDate, 'yyyy-MM-dd', 'en-GB'));
  }

  deleteCustomImage(): void {
    console.log('Revert to default image');
    const catId = this.eventFormGroup.controls.catKey.value;
    const cat = this.arrCategories.find(elem => elem.id === catId);
    this.imgUrl = cat.image;
    this.event.offer_category.image = cat.image;
    this.eventFormGroup.patchValue({ image: cat.image });
  }

  imageUploadHandler(url: string): void {
    console.log('Update image to:', url);
    this.event.offer_category.image = 'custom';
    // let obj = Object.assign(this.eventFormGroup.controls.category.value, {image: 'custom'});
    // console.log(obj);
    // this.eventFormGroup.patchValue({category: obj});
    this.eventFormGroup.patchValue({image: url});
    this.imgUrl = url;
  }

  updateEventCategory(e): void {
    const id = e.value
    const newCategory = this.arrCategories.find(elem => elem.id === id);
    // If this event has previously had a custom image loaded
    // then don't replace it if the event is changed.
    if (this.event.offer_category.image === 'custom') {
      console.log('Custom Image');
      newCategory.image = 'custom'
      this.imgUrl = this.eventFormGroup.controls.image.value;
    } else {
      console.log(newCategory);
      this.imgUrl = newCategory.image;
    }
    this.event.offer_category = newCategory;
    this.eventFormGroup.patchValue({ image: this.imgUrl});
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
        title: 'Please confirm',
        body:
          `You are about to permanently delete **${ this.event.offer_tag }**.\n` +
          `Are you sure you want to continue?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      console.log(`Delete: ${confirmed}`);
      if(!confirmed) { return; }
      this.dialogRef.close({ action: 'delete', data: this.event.offer_id });
    });
  }

  createEvent() {
    const event = this.mapEventOffer();
    console.log('CREATE', event);
    this.eventService.createEvent(event).subscribe({
      next: (obj) => {
        console.log(obj.offer_id);
        this.addRestaurantToEvent(obj.offer_id);
      },
      error: (err) => console.log('Failed to create offer', err)
    })
  }

  addRestaurantToEvent(offer_id: string): void {
    const restNum = this.restaurant.restaurant_number;
    console.log('SUBSCRIBE', offer_id, restNum);
    this.eventService.subscribeToEvent(offer_id, restNum).subscribe({
      next: (res) => {
        console.log(res);
        this.eventService.fetchRestaurantEvents(restNum);
        this.dialogRef.close({ action: 'create', data: offer_id });
      },
      error: (err) => console.log('Failed add restaurant to offer', err)
    });
  }

  mapEventOffer(): Object {
    let c = this.eventFormGroup.controls;
    return {
      offer_id: c.id.value,
      offer_channel_id: 0,
      offer_key: c.catKey.value,
      offer_updated: '',
      offer_category: this.event.offer_category,
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
