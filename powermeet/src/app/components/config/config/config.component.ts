import { Component, OnInit } from '@angular/core';
import * as microsoftTeams from "@microsoft/teams-js";

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html'
})
export class ConfigComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    console.log('config one');
    microsoftTeams.initialize();

  }
  addName() {
    alert('event fired');
    microsoftTeams.settings.setValidityState(true);
    this.saveName();
  }
  saveName() {
    microsoftTeams.settings.registerOnSaveHandler((saveEvent) => {
      microsoftTeams.settings.setSettings({
        websiteUrl: "https://powermeet-dev.azurewebsites.net/Dashboard",
        contentUrl: "https://powermeet-dev.azurewebsites.net/Dashboard",
        entityId: "grayIconTab",
        suggestedDisplayName: "PowerMeet"
      });
      saveEvent.notifySuccess();
    });
  }
}
