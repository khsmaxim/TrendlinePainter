import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { IBoorkmarks } from 'src/app/models/Bookmark';
import { environment } from 'src/environments/environment';

const KEY = 'trendline-bookmarks';

@Injectable({
  providedIn: 'root'
})
export class BoorkmarkService {

  private _data: IBoorkmarks = {};

  constructor(private httpClient: HttpClient) {}

  fetch() {
    this._data = Object.assign(this._data, JSON.parse(localStorage.getItem(KEY)!) || {}) as IBoorkmarks;
    this.httpClient.get(environment.apiURL + 'assets/bookmarks.json')
      .subscribe({
        error: () => this.handleError.bind(this),
        next: (response: any) => {
          this._data = Object.assign(this._data, response) as IBoorkmarks;
        },
      });
  }

  get data(): IBoorkmarks {
    return this._data;
  }

  public store(data: IBoorkmarks) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  public add(item: IBoorkmarks) {
    this.store({ ...this.data, ...item });
  }

  // private async fetch() {
  //   const data = await this.httpClient.get(environment.apiURL + 'assets/bookmarks.json').toPromise();
  //   console.log(data);
  // }

  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class BoorkmarksService {

  private _data: IBoorkmarks = {};

  constructor(
    private item:BoorkmarkService
  ) {}

  get data() {
    return this._data;
  }

  private store() {
    this.item.store(this._data);
  }

  public read() {
    this._data = this.item.data;
    this.item.fetch();
  }

  public add(item: IBoorkmarks) {
    this._data = { ...this._data, ...item };
    this.store();
  }

  public remove(id: string) {
    delete this._data[id];
    this.store();
  }

  public has(id: string): boolean {
    return this._data.hasOwnProperty(id);
  }
}


