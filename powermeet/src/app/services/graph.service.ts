import { Injectable } from '@angular/core';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GraphService {
  private graphClient: Client;

  constructor(private authService: AuthService) { // Initialize the Graph client
    this.graphClient = Client.init({
      authProvider: async (done) => {
        // Get the token from the auth service
        let token = await this.authService.getAccessToken()
          .catch((reason) => {
            done(reason, null);
          });
        if (token) {
          done(null, token);
        } else {
          done("Could not get an access token", null);
        }
      }
    });
  }
  async getEvents() {
    let token = sessionStorage.getItem('authconfig');
    console.log('get event call',token);
    if(token){
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) {done(null, token);}
          else {done("Could not get an access token", null)}
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/me/events')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get events', JSON.stringify(error, null, 2));
    }
  }
  async getGroupEvents(Id) {
    let token = sessionStorage.getItem('authconfig');
    console.log('get event call',token);
    if(token){
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) {done(null, token);}
          else {done("Could not get an access token", null)}
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/'+Id+'/events')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get group events', JSON.stringify(error, null, 2));
    }
  }
  async getUsers() {
    console.log('userssssssssssssssssss');
    let token = sessionStorage.getItem('authconfig');
    console.log('tokennnnnn', token);
    if(token){
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) {done(null, token);}
          else {done("Could not get an access token", null)}
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/users')
        .get();

      return result.value;
    } catch (error) {
      console.log('Could not get users', JSON.stringify(error, null, 2));
    }
  }
  getUserProfile(Id) {
    let token = sessionStorage.getItem('authconfig');
    if(token){
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) {done(null, token);}
          else {done("Could not get an access token", null)}
        }
      });
    }
    try {
      let result = this.graphClient
        .api('/users/' + Id + '/photo/$value')
        .get();

      return result;
    } catch (error) {
      console.log('Could not get user profile', JSON.stringify(error, null, 2));
    }
  }
  getMyProfile() {
    let token = sessionStorage.getItem('authconfig');
    if(token){
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) {done(null, token);}
          else {done("Could not get an access token", null)}
        }
      });
    }
    try {
      let result = this.graphClient
        .api('/me')
        .get();

      return result;
    } catch (error) {
      console.log('Could not get my details', JSON.stringify(error, null, 2));
    }
  }
  async getGroupUsers(Id) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/groups/' + Id + '/owners')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get group events', JSON.stringify(error, null, 2));
    }
  }
  async getGroupPlans() {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/me/planner/plans')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not get group events', JSON.stringify(error, null, 2));
    }
  }
  async postGroupPlan(PlannerPlan) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/planner/plans')
        .post(PlannerPlan);
      return result.value;
    } catch (error) {
      console.log('Could not post group plan', JSON.stringify(error, null, 2));
    }
  }
  async postGroupTask(PlannerTask) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/planner/tasks')
        .post(PlannerTask);
      return result.value;
    } catch (error) {
      console.log('Could not post group PlannerTask', JSON.stringify(error, null, 2));
    }
  }
  async getGroupTasks(planId) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/planner/plans/'+planId+'/tasks')
        .get();
      return result.value;
    } catch (error) {
      console.log('Could not post group PlannerTask', JSON.stringify(error, null, 2));
    }
  }

  // send mail
  async sendMail(sendMail) {
    let token = sessionStorage.getItem('authconfig');
    if (token) {
      this.graphClient = Client.init({
        authProvider: async (done) => {
          if (token) { done(null, token); }
          else { done("Could not get an access token", null) }
        }
      });
    }
    try {
      let result = await this.graphClient
        .api('/me/sendMail')
        .post(sendMail);
      return result;
    } catch (error) {
      console.log('Could not post group PlannerTask', JSON.stringify(error, null, 2));
    }
  }
}
