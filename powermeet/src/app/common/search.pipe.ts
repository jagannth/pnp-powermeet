import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'LockFilter'
})
export class SearchPipe implements PipeTransform {
//   transform(items: Array<any>, filter: {[key: string]: any }): Array<any> {
//     return items.filter(item => {
//         let notMatchingField = Object.keys(filter)
//                                      .find(key => item[key] !== filter[key]);

//         return !notMatchingField; // true if matches all fields
//     });
// }
  transform(value: any, args?: any): any {
    if(!value)return null;
    if(!args)return value;
    args = args.toLowerCase();
    //if(value.length > 0){
    return value.filter(function(item){
        return JSON.stringify(item).toLowerCase().includes(args);
    });
  //}
}

}
