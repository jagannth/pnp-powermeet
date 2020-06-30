import { NoteAudit } from './NoteAudit';
import { formatDate } from '@angular/common';

export class Note {
    NoteID: string = "00000000-0000-0000-0000-000000000000";
    Description: string = '';
    AgendaID: string;
    CreatedBy: string = sessionStorage.getItem('user');
    CreatedDate: Date = new Date();
    Type: string = '';
    AssignedTo: string = sessionStorage.getItem('user');
    AssignedDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    DueDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    Status: string;
    NoteAudit: NoteAudit;
    GroupID: string;
  }
  