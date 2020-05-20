import { Injectable } from '@angular/core';
import { LoadComponent } from './load.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})

export class LoadService {

  dialogRef: MatDialogRef<LoadComponent>;

  constructor(
    private dialog: MatDialog
  ) { }

  open(msg= 'Loading') {
    this.dialogRef = this.dialog.open(LoadComponent, {
      backdropClass: 'rc-dialog-backdrop',
      data: { message: msg },
      disableClose: true
    });
  }

  close() {
    this.dialogRef.close();
  }

  update(msg: string): void {
    this.dialogRef.componentInstance.data = {
      message: msg
    }
  }
}
