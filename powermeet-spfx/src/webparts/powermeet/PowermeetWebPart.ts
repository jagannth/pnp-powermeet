import { Version } from '@microsoft/sp-core-library';
import {
    BaseClientSideWebPart,
    IPropertyPaneConfiguration,
    PropertyPaneTextField
  } from '@microsoft/sp-webpart-base';

import { escape } from '@microsoft/sp-lodash-subset';

import * as strings from 'PowermeetWebPartStrings';
import { SPComponentLoader } from '@microsoft/sp-loader';


import 'powermeet/dist/powermeet/bundle';


export interface IPowermeetWebPartProps {
  description: string;
}

export default class PowermeetWebPart extends BaseClientSideWebPart<IPowermeetWebPartProps> {
  public constructor() {
    super();
    SPComponentLoader.loadCss("https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css");
    SPComponentLoader.loadCss("https://unpkg.com/angular-calendar@0.28.20/css/angular-calendar.css");
    SPComponentLoader.loadScript("https://kit.fontawesome.com/74a9a9044f.js");

    SPComponentLoader.loadScript("https://code.jquery.com/jquery-3.4.1.slim.min.js");
    SPComponentLoader.loadScript("https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js");
    SPComponentLoader.loadScript("https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js");
  }

  public async render(): Promise<void> {
    const tokenProvider = await this.context.aadTokenProviderFactory.getTokenProvider();
    console.log('context1', this.context);
    const val = tokenProvider.getToken("https://graph.microsoft.com");
    val.then(res => {
      sessionStorage.setItem('siteUrl',this.context.pageContext.site.absoluteUrl);
      var group: string;
      if(this.context.pageContext.site.group == undefined){
        group = undefined;
      }else{
        group = this.context.pageContext.site.group.id._guid;
      }
      this.domElement.innerHTML = `<app-powermeet-web-part description="${res}" user="${this.context.pageContext.user.email}" group="${group}"> </app-powermeet-web-part>`;
    });
   
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
