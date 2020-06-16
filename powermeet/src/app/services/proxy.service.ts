import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContextService } from './context.service';

@Injectable({
  providedIn: 'root'
})
export class ProxyService {
 public baseUrl = 'https://powermeet-api.azurewebsites.net/api/'; 
  // public baseUrl = 'http://localhost:10124/api/'; 

  constructor(private http : HttpClient, public contextService : ContextService) { }
  private createBasicHeader(headers: HttpHeaders) {
    headers.append('Accept', 'application/json, application/javascript');
  }
  private createConfig(): any {
    const config = {
      headers: {
      Authorization: 'bearer 00D5C00000010B6!AREAQIBOUhRwqiJkPl2AZiJf4oyDpFaJt3IxG1XyY6.0gyfxFd2OQQ8bZa.oxWQmvaXXZdecMSEpsXSZsa7Ik7gfkEI3tDa6',
      responseType: 'blob' as 'json'
        // Accept: 'application/json, application/javascript',
       // wm_customerID: 'a0dd2777-4239-47f7-b07c-171a09eebe6f',// this.contextService.ContextInfo.wMCustomer_ID.toString(),
       // userID: 'f55b3229-99b6-40e0-a87f-f0d7dbbff80b' //this.contextService.ContextInfo.userId.toString() // temporary
      },
      // attempts: 0,
      // cache: false,
      // timeout: 30000, // 30 seconds
      // withCredentials: false
    };
    return config;
  }
  public Get(url: string): Observable<any> {
    const observable = this.http.get(this.baseUrl + url, this.createConfig()); // .pipe(map((response: any) => response.json()));
    return observable;
  }

  public Post(url: string, data: any): Observable<any> {
    const observable = this.http.post(this.baseUrl + url, data, this.createConfig()); // .pipe(map((response: any) => response.json()));
    return observable;
  }

  public PostFileUpload(url: string, data: any, file: any): Observable<any> {
    data.append('fileUpload', file);
    const observable = this.http.post(this.baseUrl + url, data, this.createConfig()); // .pipe(map((response: any) => response.json()));
    return observable;
  }

  public Put(url: string, data: any): Observable<any> {
    const observable = this.http.put(this.baseUrl + url, data, this.createConfig()).pipe(map((response: any) => response.json()));
    return observable;
  }
  public Delete(url: string): Observable<any> {
    const observable = this.http.delete(this.baseUrl + url, this.createConfig()).pipe(map((response: any) => response));
    return observable;
  }
  public GetImage(): Observable<any> {
    const observable = this.http.get('http://localhost:2821/api/prelien/getBlobData/0685C000000Ntw2QAC', this.createConfig());//.pipe(map((response: any) => response.json()));
    return observable;
  }
}
