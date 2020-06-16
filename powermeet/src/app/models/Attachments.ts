export class Attachments {
    public AttachmentID : string;
    public AttachmentName :string;
    public AgendaID:string;
    public MeetingID :string;
    public file :any;
    constructor() {
        this.AttachmentID = '00000000-0000-0000-0000-000000000000';
        this.AgendaID = '00000000-0000-0000-0000-000000000000';
        this.MeetingID = '00000000-0000-0000-0000-000000000000';
    }
}