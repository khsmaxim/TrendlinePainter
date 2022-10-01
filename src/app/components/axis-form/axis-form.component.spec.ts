import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AxisFormComponent } from './axis-form.component';

describe('AxisFormComponent', () => {
  let component: AxisFormComponent;
  let fixture: ComponentFixture<AxisFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AxisFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AxisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
