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
    // load our Event categories
    this.arrCategories = this.eventService.getEventsArr();
    console.log(`New Event: ${this.isNewEvent}`);
    // If this is a new Event then we need to set
    // a default category
    if (this.isNewEvent) {
      const dfCat = this.arrCategories[0];
      this.event = Object.assign(this.event, {
        offer_category: dfCat,
        offer_key: dfCat.id,
        offer_image: dfCat.image
      });
    }
    // build the form
    this.initEventForm();
  }

  initEventForm(): void {

    // console.log('initEventForm', this.event);
    // console.log('?', this.event.offer_category);

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
      return;
    }
    // set image
    this.imgUrl = this.event.offer_image;
  }

  /**
   * Format the date strings generated by the picker to yyyy-MM-dd
   * @param control the form element
   * @param event the value
   */
  addEventDate(control: string, event: MatDatepickerInputEvent<Date>): void {
    // comment this out to revert to timestamp format
    const inDate = event.value || 0;
    this.eventFormGroup.controls[control]
      .patchValue(formatDate(inDate, 'yyyy-MM-dd', 'en-GB'));
  }

  /**
   * Remove the custom image from an Event and
   * revert to the appropriate category image
   * Note: this will only be permanent if UPDATED by the user
   */
  deleteCustomImage(): void {
    console.log('Reverting to default image');
    // get the current Event key/id
    const catId = this.eventFormGroup.controls.catKey.value;
    // Use it to find the relevant category
    const cat = this.arrCategories.find(elem => elem.id === catId);
    // update the displayed image
    this.imgUrl = cat.image;
    // update the event category object, held in session
    this.event.offer_category.image = cat.image;
    // update the form reference
    this.eventFormGroup.patchValue({ image: cat.image });
  }

  /**
   * This is the callback function invoked by the
   * cloudinary widget
   * @param url returned by the cloudinary widget
   */
  imageUploadHandler(url: string): void {
    // console.log('Update image to:', url);
    // update the session Event
    this.event.offer_category.image = 'custom';
    // update the form value
    this.eventFormGroup.patchValue({image: url});
    // update the displayed image
    this.imgUrl = url;
  }

  /**
   * The change event triggered by the category select element
   * If the Event is using a custom image then
   * we won't overwrite that with the defaults
   * @param e the target element
   */
  updateEventCategory(e): void {
    const id = e.value
    // create a category object which will be used
    // to update our session Event
    const newCategory = this.arrCategories.find(elem => elem.id === id);

    // If currently using a custom image
    if (this.event.offer_category.image === 'custom') {
      // console.log('Custom Image');
      newCategory.image = 'custom'
      this.imgUrl = this.eventFormGroup.controls.image.value;
    } else {
      // console.log(newCategory);
      this.imgUrl = newCategory.image;
    }
    // now update the session Event & form
    this.event.offer_category = newCategory;
    this.eventFormGroup.patchValue({ image: this.imgUrl});
  }

  // Save out Event changes
  updateEvent(): void {
    // before sending back our new Event object
    // we need to do some remodelling of the data
    const event = this.mapEventOffer();
    // now complete it
    this.dialogRef.close({ action: 'update', data: event });
    console.log(this.eventFormGroup.valid);
  }

  /**
   * To make an Event 'inactive' we'll just
   * update the marketing end date to 'now'.
   */
  deactivateEvent(): void {
    // Confirm/cancel
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
      // console.log(`Deactivate: ${confirmed}`);
      if(!confirmed) { return; }
      // set new marketing end date & save.
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

  // Create the offer
  createEvent() {
    const event = this.mapEventOffer();
    // console.log('CREATE', event);
    this.eventService.createEvent(event).subscribe({
      next: (obj) => {
        // console.log(obj.offer_id);
        this.addRestaurantToEvent(obj.offer_id);
      },
      error: (err) => console.error('Failed to create offer', err)
    })
  }

  /**
   * After an offer has been successfully created
   * we need to subscribe the current restaurant to
   * that offer
   * @param offer_id the id returned by eventService.createEvent
   */
  addRestaurantToEvent(offer_id: string): void {
    const restNum = this.restaurant.restaurant_number;
    // console.log('SUBSCRIBE', offer_id, restNum);
    this.eventService.subscribeToEvent(offer_id, restNum).subscribe({
      next: (res) => {
        // console.log(res);
        // reload Events & close the dialog
        this.eventService.fetchRestaurantEvents(restNum);
        this.dialogRef.close({ action: 'create', data: offer_id });
      },
      error: (err) => console.error('Failed add restaurant to offer', err)
    });
  }

  /**
   * Remodel our Event object to match
   * the original db Event
   */
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
