import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityDropdownComponent } from './city-dropdown.component';

describe('CityDropdownComponent', () => {
  let component: CityDropdownComponent;
  let fixture: ComponentFixture<CityDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
