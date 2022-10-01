
export default class ObjectUtil {

  static getFirst(obj: any): any {
    for (let key in obj) {
      return {
        key: key,
        value: obj[key]
      }
    }
  }

  static isObject(item:any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  static mergeDeep(target:any, ...sources:any): any {
    if (!sources.length) return target;
    const source = sources.shift();
    if (ObjectUtil.isObject(target) && ObjectUtil.isObject(source)) {
      for (const key in source) {
        if (ObjectUtil.isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} });
          }else{
            target[key] = Object.assign({}, target[key])
          }
          ObjectUtil.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    return ObjectUtil.mergeDeep(target, ...sources);
  }
}
