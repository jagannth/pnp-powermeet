import { AgendaItems } from './AgendaItem';
import { MeetingAttendees } from './MeetingAttendees';

export class Meeting {
    public MeetingID : string = "00000000-0000-0000-0000-000000000000";
    public MeetingName :string;
    public MeetingDescription:string;
    public Status:string;
    public StartDate :string;
    public EndDate :string;
    public Organizer :string;
    public Time :string;
    public IsActive : boolean;
    public IsRecurring : boolean;
    public AgendaItems : AgendaItems[]= [];
    public MeetingAttendees : MeetingAttendees[] = [];
    public UserName: string;
    public IsGroup: boolean = false;
    public GroupID: string;
    constructor() {
        this.MeetingID = "00000000-0000-0000-0000-000000000000"; // this value is nothing but the empty guid..
        this.IsActive = true;
        this.IsRecurring = false;
    }
}