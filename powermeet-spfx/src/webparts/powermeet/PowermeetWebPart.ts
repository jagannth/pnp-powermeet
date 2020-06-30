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
      this.domElement.innerHTML = `<app-powermeet-web-part description="${res}" user="${this.context.pageContext.user.email}" group="${this.context.pageContext.site.group.id._guid}"> </app-powermeet-web-part>`;
      //site url siteUrl="${this.context.pageContext.site.absoluteUrl}"
      // let ngElement = this.domElement.getElementsByTagName('app-powermeet-web-part')[0];
      // if(ngElement) {
      //   this.domElement.removeChild(ngElement);
      // }
      // const ElementListRest = customElements.get('app-powermeet-web-part');
      // const element = new ElementListRest();
      // // element.context = this.context;
      // element.description = res;
      // console.log('ress', res);
      // element.user = this.context.pageContext.user.email;
      // element.group = this.context.pageContext.site.group.id._guid;
      // this.domElement.appendChild(element);
    });
    // this.domElement.innerHTML = `<!-- Button trigger modal -->
    // <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
    //   Launch demo modal
    // </button>
    
    // <!-- Modal -->
    // <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    //   <div class="modal-dialog">
    //     <div class="modal-content">
    //       <div class="modal-header">
    //         <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
    //         <button type="button" class="close" data-dismiss="modal" aria-label="Close">
    //           <span aria-hidden="true">&times;</span>
    //         </button>
    //       </div>
    //       <div class="modal-body">
    //         ...
    //       </div>
    //       <div class="modal-footer">
    //         <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    //         <button type="button" class="btn btn-primary">Save changes</button>
    //       </div>
    //     </div>
    //   </div>
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
