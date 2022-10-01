import { Pipe, PipeTransform } from '@angular/core';
import { IBoorkmarks, Boorkmark } from 'src/app/models/Bookmark';

@Pipe({
  name: 'tendlineStorageData',
  pure: false
})
export class TendlineStorageDataPipe implements PipeTransform {

  transform(data: IBoorkmarks): Array<{key: string, value: Boorkmark }> {
    let index: number = 0;
    let result = new Array<{key: string, value: Boorkmark }>();
    Object.entries(data).forEach(([key, value]) => {
      for (let ii = 0; ii < result.length; ii++) {
        if (value.time > result[ii].value.time) {
          index++;
        }
        else {
          index = ii;
          break;
        }
      }
      result.splice(index, 0, {key: key, value: new Boorkmark(value)});
    });
    return result;
  }
}
