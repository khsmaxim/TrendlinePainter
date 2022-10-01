import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarksModalComponent } from './bookmarks-modal.component';

describe('BookmarksModalComponent', () => {
  let component: BookmarksModalComponent;
  let fixture: ComponentFixture<BookmarksModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookmarksModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
