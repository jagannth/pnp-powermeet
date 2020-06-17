import { Version } from '@microsoft/sp-core-library';
import {
    BaseClientSideWebPart,
    IPropertyPaneConfiguration,
    PropertyPaneTextField
  } from '@microsoft/sp-webpart-base';

import { escape } from '@microsoft/sp-lodash-subset';

import * as strings from 'PowermeetWebPartStrings';
import * as bootstrap from 'bootstrap';
import { SPComponentLoader } from '@microsoft/sp-loader';


import 'powermeet/dist/powermeet/bundle';


export interface IPowermeetWebPartProps {
  description: string;
}

export default class PowermeetWebPart extends BaseClientSideWebPart<IPowermeetWebPartProps> {
  public constructor() {
    super();
    SPComponentLoader.loadCss("https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css");
    SPComponentLoader.loadScript("https://kit.fontawesome.com/74a9a9044f.js");

    SPComponentLoader.loadScript("https://code.jquery.com/jquery-3.4.1.slim.min.js");
    SPComponentLoader.loadScript("https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js");
    SPComponentLoader.loadScript("https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js");
  }

  public render(): void {
    // const tokenProvider = await this.context.aadTokenProviderFactory.getTokenProvider();
    // console.log('context', this.context.pageContext);
    // const val = tokenProvider.getToken("https://graph.microsoft.com");
    // val.then(res => {
    //   this.domElement.innerHTML = `<app-powermeet-web-part description="${ res }" user="${this.context.pageContext.user.email}"></app-powermeet-web-part>`;
    // })
    //this.domElement.innerHTML = `<app-powermeet-web-part description="${ this.context }"></app-powermeet-web-part>`;
      let ngElement = this.domElement.getElementsByTagName('app-powermeet-web-part')[0];
      if(ngElement) {
        this.domElement.removeChild(ngElement);
      }
      const ElementListRest = customElements.get('app-powermeet-web-part');
      const element = new ElementListRest();
      element.context = this.context;
      this.domElement.appendChild(element);
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
