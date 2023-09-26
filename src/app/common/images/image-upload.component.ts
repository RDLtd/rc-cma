import { Component, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../environments/environment';

//declare var cloudinary: any;

@Component({
  selector: 'rc-image-upload',
  templateUrl: './image-upload.component.html'
})
export class ImageUploadComponent {
  @Output() onImgUploaded = new EventEmitter<any>();
  cloudName = environment.cloudinary_name; // replace with your own cloud name
  uploadPreset = "nozxac7z"; // replace with your own upload preset
  myWidget: any;

  // Remove the comments from the code below to add
  // additional functionality.
  // Note that these are only a few examples, to see
  // the full list of possible parameters that you
  // can add see:
  //   https://cloudinary.com/documentation/upload_widget_reference

  ngOnInit() {
    //console.log('Cloudinary', cloudinary);
    this.myWidget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: this.cloudName,
        uploadPreset: this.uploadPreset,
        cropping: true, //add a cropping step
        // showAdvancedOptions: true,  //add advanced options (public_id and tag)
        sources: [ "local", "url", "google_drive", "dropbox", "camera"], // restrict the upload sources to URL and local files
        multiple: false,  //restrict upload to a single file
        folder: "event_images", //upload files to the specified folder
        // tags: ["users", "profile"], //add the given tags to the uploaded files
        // context: {alt: "user_uploaded"}, //add the given context data to the uploaded files
        // clientAllowedFormats: ["images"], //restrict uploading to image files only
        // maxImageFileSize: 2000000,  //restrict file size to less than 2MB
        // maxImageWidth: 2000, //Scales the image down to a width of 2000 pixels before uploading
        theme: "Custom", //change to a purple theme
        styles: {
          palette: {
            window: "#FFFFFF",
            sourceBg: "#FFFFFF",
            windowBorder: "#222F3C",
            tabIcon: "#04A5C2",
            inactiveTabIcon: "#222F3C",
            menuIcons: "#04A5C2",
            link: "#04A5C2",
            action: "#5333FF",
            inProgress: "#04A5C2",
            complete: "#33ff00",
            error: "#cc3333",
            textDark: "#222F3C",
            textLight: "#ffffff"
          },
          fonts: {
            default: 'Roboto',
            "sans-serif": {
              url: null,
              active: true
            }
          }
        },

      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log("Done! Here is the image info: ", result.info);
          this.onImgUploaded.emit(result.info.secure_url);
          document
            .getElementById("eventImage")
            .setAttribute("src", result.info.secure_url);
        }
      }
    );
  }

  openWidget() {
    this.myWidget.open();
  }
}
