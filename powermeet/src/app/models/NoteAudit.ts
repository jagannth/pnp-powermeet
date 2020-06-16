export class NoteAudit {
    ID: string = "00000000-0000-0000-0000-000000000000";
    NoteID: string = "00000000-0000-0000-0000-000000000000";
    CreatedBy: string = sessionStorage.getItem('user');
    CreatedDate: Date;
    LastUpdatedBy: string = sessionStorage.getItem('user');
    LastUpdatedDate: Date;
    UpdatedCount: number = -1;
  }
  