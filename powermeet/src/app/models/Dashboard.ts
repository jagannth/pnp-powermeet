import { Note } from './Note';
import { NoteAudit } from './NoteAudit';
import { Meeting } from './Meeting';

export class Dashboard {
  public Note: Note;
  public NoteAudit: NoteAudit;
  public Meeting: Meeting;
  constructor(){
    this.Meeting   = new Meeting();
  }
}

export class DashboardCounts {
  public Meeting: number;
  public Risk: number;
  public Action: number;
  public Decision: number;
  public Planned: number;
  public InProgress: number;
  public CloseToDeliver: number;
  public Completed: number;
  public MyRisk: number;
  public MyAction: number;
  public MyDecision: number;
  public MyPlanned: number;
  public MyInProgress: number;
  public MyCloseToDeliver: number;
  public MyCompleted: number;
  constructor() {
    this.Meeting = 0;
    this.Risk = 0;
    this.Action = 0;
    this.Decision = 0;
    this.Planned = 0;
    this.InProgress = 0;
    this.CloseToDeliver = 0;
    this.Completed = 0;
    this.MyRisk = 0;
    this.MyAction = 0;
    this.MyDecision = 0;
    this.MyPlanned = 0;
    this.MyInProgress = 0;
    this.MyCloseToDeliver = 0;
    this.MyCompleted = 0;
  }
}


