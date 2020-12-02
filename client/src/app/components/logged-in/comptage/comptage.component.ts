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
  selector: 'app-comptage',
  templateUrl: './comptage.component.html',
  styleUrls: ['./comptage.component.scss']
})
export class ComptageComponent {
  public files: NgxFileDropEntry[] = [];
  public displayError = false;
  public displaySuccess = false;
  public message = '';

  public constructor(
    public _fileSubmissionService: FileSubmissionService,
    private _router: Router
  ) {}

  public dropped(files: NgxFileDropEntry[]): void {
    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          console.log(droppedFile.relativePath, file);
        });
      } else {
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
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
    this.displayError = false;
    this.displaySuccess = false;
    if (this.files.length > 0) {
      const fileEntry = this.files[0].fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this._fileSubmissionService.postNewCSVMV(file).subscribe((results) => {
          if (results.length > 0) {
            this.displaySuccess = true;
            this.message = 'Succès Upload';
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
