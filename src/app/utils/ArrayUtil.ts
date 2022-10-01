
export default class ArrayUtil {

  /**
   * Push element at the end of array and shift element from the start if out of length range
   * @param {Array<any>} arr target array
   * @param {any} element to push
   * @return {any | null} removed element or null if in range of length
   */
  static extrude(arr: Array<any>, element: any, length: number): any | null {
    arr.push(element);
    if (arr.length > length) {
      return arr.shift();
    }
    return arr[0];
  }
}
