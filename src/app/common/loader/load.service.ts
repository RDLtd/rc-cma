import { Injectable } from '@angular/core';
import { LoadComponent } from './load.component';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class LoadService {

  dialogRef: MatDialogRef<LoadComponent>;

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog
  ) { }

  open(msg = this.translate.instant('LOADER.msgDefaultLoading')) {
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
    };
  }
}
