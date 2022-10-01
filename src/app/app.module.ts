import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe  } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TrendlineComponent } from 'src/app/components/trendline/trendline.component';
import { BookmarksModalComponent } from 'src/app/modals/bookmarks-modal/bookmarks-modal.component';
import { DeleteConfirmModalComponent } from 'src/app/modals/delete-confirm-modal/delete-confirm-modal.component';
import { TendlineStorageDataPipe } from 'src/app/pipes/trendline-storage-data/tendline-storage-data.pipe';
import { AxisFormComponent } from './components/axis-form/axis-form.component';

@NgModule({
  declarations: [
    AppComponent,
    TrendlineComponent,
    BookmarksModalComponent,
    DeleteConfirmModalComponent,
    TendlineStorageDataPipe,
    AxisFormComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    DecimalPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
