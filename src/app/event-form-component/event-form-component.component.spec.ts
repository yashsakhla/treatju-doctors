import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFormComponentComponent } from './event-form-component.component';

describe('EventFormComponentComponent', () => {
  let component: EventFormComponentComponent;
  let fixture: ComponentFixture<EventFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
