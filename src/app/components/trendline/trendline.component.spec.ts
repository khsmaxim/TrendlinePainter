import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendlineComponent } from './trendline.component';

describe('TrendlineComponent', () => {
  let component: TrendlineComponent;
  let fixture: ComponentFixture<TrendlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrendlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
