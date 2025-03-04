import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitDoctorComponent } from './visit-doctor.component';

describe('VisitDoctorComponent', () => {
  let component: VisitDoctorComponent;
  let fixture: ComponentFixture<VisitDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitDoctorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
