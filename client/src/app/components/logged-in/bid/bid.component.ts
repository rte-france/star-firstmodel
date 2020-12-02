/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component} from '@angular/core';
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry
} from 'ngx-file-drop';
import {FileSubmissionService} from '../../../services/fileSubmissionService/fileSubmissionService';
import {Router} from '@angular/router';

@Component({
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.scss']
})
export class BidComponent {
  public filesBid: NgxFileDropEntry[] = [];
  public filesPowerPlanEnergySchedule: NgxFileDropEntry[] = [];
  public uploadedPowerPlanEnergyScheduleIds: string[] = [];
  public uploadedBidIds: string[] = [];
  public displayError = false;
  public displaySuccessBid = false;
  public displaySuccessPowerPlanEnergySchedule = false;
  public message = '';

  public constructor(
    public _fileSubmissionService: FileSubmissionService,
    private _router: Router
  ) {}

  public droppedBid(files: NgxFileDropEntry[]) {
    this.filesBid = files;
    this.filesPowerPlanEnergySchedule = [];
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {});
      } else {
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  public droppedPowerPlanEnergySchedule(files: NgxFileDropEntry[]) {
    this.filesPowerPlanEnergySchedule = files;
    this.filesBid = [];
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {});
      } else {
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  public fileOver(event): void {
    console.log(event);
  }

  public fileLeave(event): void {
    console.log(event);
  }

  public submitFile(): void {
    this.displaySuccessBid = false;
    this.displayError = false;
    this.displaySuccessPowerPlanEnergySchedule = false;
    if (
      this.filesBid.length > 0 &&
      this.filesPowerPlanEnergySchedule.length > 0
    ) {
      const fileEntryBid = this.filesBid[0].fileEntry as FileSystemFileEntry;
      fileEntryBid.file((file: File) => {
        this._fileSubmissionService.postNewCSVBid(file).subscribe((results) => {
          if (results.length > 0) {
            this.displaySuccessBid = true;
            this.uploadedBidIds = results;
          } else if (results.errorMessage.indexOf('Reason: ') !== -1) {
            this.displayError = true;
            this.message = results.errorMessage;
          } else {
            this.displayError = true;
            this.message = 'Impossible de contacter le serveur';
          }
        });
      });
      const fileEntryPowerPlanEnergySchedule = this
        .filesPowerPlanEnergySchedule[0].fileEntry as FileSystemFileEntry;
      fileEntryPowerPlanEnergySchedule.file((file: File) => {
        this._fileSubmissionService
          .postNewCSVPowerPlanEnergySchedule(file)
          .subscribe((results) => {
            if (results.length > 0) {
              this.displaySuccessPowerPlanEnergySchedule = true;
              this.uploadedPowerPlanEnergyScheduleIds = results;
            } else if (results.errorMessage.indexOf('Reason: ') !== -1) {
              this.displayError = true;
              this.message = results.errorMessage;
            } else {
              this.displayError = true;
              this.message = 'Impossible de contacter le serveur';
            }
          });
      });
    } else if (this.filesBid.length > 0) {
      const fileEntry = this.filesBid[0].fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this._fileSubmissionService.postNewCSVBid(file).subscribe((results) => {
          if (results.length > 0) {
            this.displaySuccessBid = true;
            this.uploadedBidIds = results;
          } else if (results.errorMessage.indexOf('Reason: ') !== -1) {
            this.displayError = true;
            this.message = results.errorMessage;
          } else {
            this.displayError = true;
            this.message = 'Impossible de contacter le serveur';
          }
        });
      });
    } else if (this.filesPowerPlanEnergySchedule.length > 0) {
      const fileEntry = this.filesPowerPlanEnergySchedule[0]
        .fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this._fileSubmissionService
          .postNewCSVPowerPlanEnergySchedule(file)
          .subscribe((results) => {
            if (results.length > 0) {
              this.displaySuccessPowerPlanEnergySchedule = true;
              this.uploadedPowerPlanEnergyScheduleIds = results;
            } else if (results.errorMessage.indexOf('Reason: ') !== -1) {
              this.displayError = true;
              this.message = results.errorMessage.split('Reason: ')[1];
            } else {
              this.displayError = true;
              this.message = 'Impossible de contacter le serveur';
            }
          });
      });
    } else {
      this.displayError = true;
      this.message = 'Veuillez sélectionner un fichier';
    }
  }

  public redirect(): void {
    this._router.navigate(['./composition']);
  }
}
