import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import { escape } from '@microsoft/sp-lodash-subset';

import * as strings from 'PowermeetWebPartStrings';
import { SPComponentLoader } from '@microsoft/sp-loader';

import * as jQuery from 'jquery';
import * as bootstrap from 'bootstrap';


import 'powermeet/dist/powermeet/bundle';


export interface IPowermeetWebPartProps {
  description: string;
}

export default class PowermeetWebPart extends BaseClientSideWebPart<IPowermeetWebPartProps> {
  public constructor() {
    super();
    SPComponentLoader.loadCss("https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css");
    SPComponentLoader.loadScript("https://kit.fontawesome.com/74a9a9044f.js");
    SPComponentLoader.loadCss('//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css');

    SPComponentLoader.loadScript("https://code.jquery.com/jquery-3.5.1.slim.min.js");
    SPComponentLoader.loadScript("https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js");
    SPComponentLoader.loadScript("https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js");
  }

  public async render(): Promise<void> {

    const tokenProvider = await this.context.aadTokenProviderFactory.getTokenProvider();
    console.log('context', this.context.pageContext);
    const val = tokenProvider.getToken("https://graph.microsoft.com");
    val.then(res => {
      this.domElement.innerHTML = `<app-powermeet-web-part description="${ res }" user="${this.context.pageContext.user.email}"></app-powermeet-web-part>`;
    })
    // this.domElement.innerHTML = `<button type="button" id="btnModel" class="btn btn-primary">Open Modal</button>
    // <div class="modal fade" id="myModal" role="dialog">
    //     <div class="modal-dialog">
    //         <div class="modal-content">
    //             <div class="modal-header">
    //                 <button type="button" class="close" data-dismiss="modal">&times;</button>
    //                 <h4 class="modal-title">Modal Header</h4>
    //             </div>
    //             <div class="modal-body">
    //                 <p>Welcome bootstrap model popup in sharepoint framework client side webpart</p>
    //             </div>
    //             <div class="modal-footer">
    //                 <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
    //             </div>
    //         </div>
    //     </div>
    // </div>`;
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
