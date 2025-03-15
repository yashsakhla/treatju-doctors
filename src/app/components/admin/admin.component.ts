import { Component, OnInit } from '@angular/core';
import { Offcanvas } from 'bootstrap';
import { Subscription } from 'rxjs';
import { RestService } from '../../core/rest/rest.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EventFormComponentComponent } from '../event-form-component/event-form-component.component';

interface Event {
  eventName: string;
  eventPlace: string;
  eventDate: string;
  startTime: string;
  endTime: string;
}

interface Doctor {
  name: string;
  address: string;
  mobile: string;
  pass: string;
}

interface Staff {
  name: string;
  address: string;
  mobile: string;
  pass: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventFormComponentComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  isSidebarOpen = true;
  selectedCity: any;
  show: string = 'dashboard';

  eventForm!: FormGroup;
  doctorForm!: FormGroup;
  staffForm!: FormGroup;

  events!: Event;
  doctors: Doctor[] = [];
  staff: Staff[] = [];

  showDoctorForm = false;
  showStaffForm = false;
  existData:any;

  dashboardData = [
    { title: 'Total Doctors', value: 1 },
    { title: 'Total Staff', value: 0 },
    { title: 'Total Bookings', value: 0 },
    { title: 'Pending Bookings', value: 0 },
    { title: 'Completed Bookings', value: 0 },
    { title: 'Cancelled Bookings', value: 0 }
  ];

  patients = [
    { name: 'Rahul Sharma', gender: 'M', email: 'rahul@example.com', mobile: '9876543210', status: 'Pending' },
    { name: 'Priya Verma', gender: 'F', email: 'priya@example.com', mobile: '9123456789', status: 'Pending' },
    { name: 'Amit Kumar', gender: 'M', email: 'amit@example.com', mobile: '9012345678', status: 'Complete' }
  ];

  

  constructor(private rest: RestService, private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      eventName: ['', Validators.required],
      eventPlace: ['', Validators.required],
      eventDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });

    this.doctorForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      pass: ['', Validators.required],
    });

    this.staffForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      pass: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.existData=this.rest.userData?.data;
    this.events = this.rest.userData?.data.eventDetails[0];
    if(this.events){
      this.patchValue(this.events);
      this.doctors = this.existData.doctors ? this.existData.doctors : [];
      this.staff = this.existData.staff ? this.existData.staff : [];
    }
  }

  patchValue(events:any){
    this.eventForm = this.fb.group({
      eventName: [events.eventName, Validators.required],
      eventPlace: [events.eventPlace, Validators.required],
      eventDate: [events.eventDate, Validators.required],
      startTime: [events.startTime, Validators.required],
      endTime: [events.endTime, Validators.required],
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showContent(path: string) {
    this.show = path;
  }

  addEvent() {
    if (this.eventForm.valid) {
      const data =  {
        data: {
          ...this.existData,
          eventDetails: [this.eventForm.value]
        }
      };
      this.rest.addEvent(data).subscribe((res: any) => {
        this.existData = res.data;
        this.events = this.existData.eventDetails[0];
        this.patchValue(this.events);
      });
      this.showDoctorForm = true;
    }
  }

  addDoctor() {
    console.log(this.doctorForm);
    if (this.doctorForm.valid) {
      this.doctors.push(this.doctorForm.value);
      const data ={
        data: {
          ...this.existData,
          doctors: this.doctors // Append new doctor
        }
      };
      // this.rest.addEventDoctor(data).subscribe((res:any)=>{
      //   this.existData = res.data;
      //   this.doctors = res.data.doctors;
      //   this.showStaffForm = true;
      //   this.doctorForm.reset();
      // })
    }
  }

  addStaff() {
    if (this.staffForm.valid) {
      this.staff.push(this.staffForm.value);
      const data = {
        data: {
          ...this.existData,
          staff: this.staff // Append new doctor
        }
      };
      // this.rest.addEventStaff(data).subscribe((res:any)=>{
      //   this.existData = res.data;
      //   this.staff = this.existData.staff;
      //   this.staffForm.reset();
      // })
    }
  }

  deleteDoctor(index: number) {
    this.doctors.splice(index, 1);
  }

  deleteStaff(index: number) {
    this.staff.splice(index, 1);
  }

  // Toggle Status (Pending <-> Complete)
  toggleStatus(index: number) {
    this.patients[index].status = this.patients[index].status === 'Pending' ? 'Complete' : 'Pending';
  }

  // Remove Patient from List
  removePatient(index: number) {
    this.patients.splice(index, 1);
  }
}
