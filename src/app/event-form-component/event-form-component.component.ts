import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-event-form-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form-component.component.html',
  styleUrl: './event-form-component.component.scss'
})
export class EventFormComponentComponent {
  @Input() existingEvent: any;
  @Output() eventSaved = new EventEmitter<any>();

  eventForm: FormGroup;
  doctors: string[] = [];
  nurses: string[] = [];
  admins: string[] = [];
  services: string[] = [];

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      eventName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.existingEvent) {
      this.eventForm.patchValue(this.existingEvent);
      this.doctors = [...(this.existingEvent.doctors || [])];
      this.nurses = [...(this.existingEvent.nurses || [])];
      this.admins = [...(this.existingEvent.admins || [])];
      this.services = [...(this.existingEvent.services || [])];
    }
  }

  addDoctor(name: string) { if (name) this.doctors.push(name); }
  addNurse(name: string) { if (name) this.nurses.push(name); }
  addAdmin(name: string) { if (name) this.admins.push(name); }
  addService(name: string) { if (name) this.services.push(name); }

  removeDoctor(index: number) {
    this.doctors.splice(index, 1);
  }
  
  removeNurse(index: number) {
    this.nurses.splice(index, 1);
  }
  
  removeAdmin(index: number) {
    this.admins.splice(index, 1);
  }
  
  removeService(index: number) {
    this.services.splice(index, 1);
  }
  

  submitEvent() {
    const eventData = {
      ...this.eventForm.value,
      doctors: this.doctors,
      nurses: this.nurses,
      admins: this.admins,
      services: this.services
    };
    this.eventSaved.emit(eventData);
  }
}
