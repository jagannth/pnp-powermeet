import { AgendaAssignees } from './AgendaAssigees';
import { Attachments } from './Attachments';
import { AgendaAttendees } from './AgendaAttendees';
import { Note } from './Note';

export class AgendaItems {
    public AgendaID : string;
    public AgendaName :string;
    public AgendaDescription:string;
    public StartTime :string;
    public EndTime :string;
    public AttachmentID :string;
    public MeetingID :string;
    public Duration :string;
    public TemplateID :string;
    public Status :string;
    public UserName :string;
    public IsApproved : boolean;
    public AgendaAssignees : AgendaAssignees;
    public AgendaAttendees : AgendaAttendees[] = [];
    public Attachments : Attachments[] = [];
    public Color: string = '';
    public Notes : Note[] = [];
    constructor() {
        this.AgendaID = '00000000-0000-0000-0000-000000000000';
        this.AttachmentID = '1bd9cb80-5830-406d-9656-5127f36d1e53';
        this.TemplateID = '0643b9c5-e33a-400d-bbea-6cde37d8a0dd';
        this.MeetingID = '00000000-0000-0000-0000-000000000000';
        this.IsApproved = true;
        this.AgendaAssignees = new AgendaAssignees();
    }
}