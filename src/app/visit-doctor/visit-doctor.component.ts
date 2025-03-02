import { Component } from '@angular/core';

import { RestService } from '../core/rest/rest.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EventFormComponentComponent } from '../event-form-component/event-form-component.component';

interface Staff {
  name: string;
  address: string;
  mobile: string;
  pass: string;
}

@Component({
  selector: 'app-visit-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventFormComponentComponent],
  templateUrl: './visit-doctor.component.html',
  styleUrl: './visit-doctor.component.scss'
})
export class VisitDoctorComponent {
    isSidebarOpen = true;
    selectedCity: any;
    show: string = 'dashboard';
  
    doctorForm!: FormGroup;
    staffForm!: FormGroup;

    visitDoctor:any;
    staff: Staff[] = [];
  
    showDoctorForm = false;
    showStaffForm = false;
    existData:any;
  
    totalPatients = 50; // Example number of total patients
    completedPatients = 30; // Example completed patients count
    feePerPatient = 500; // Example fee per completed patient
    adminRevenuePercentage = 0.2; // 20% Admin Revenue
  
    dashboardData = [
      { title: 'Total Staff', value: 10 },
      { title: 'Total Bookings', value: this.totalPatients },
      { title: 'Pending Bookings', value: this.totalPatients - this.completedPatients },
      { title: 'Completed Bookings', value: this.completedPatients },
      { title: 'Cancelled Bookings', value: 5 },
      { title: 'Fee Collection', value: `₹${this.completedPatients * this.feePerPatient}` },
      { 
        title: 'Admin Revenue (20%)', 
        value: `₹${(this.completedPatients * this.feePerPatient * this.adminRevenuePercentage).toFixed(2)}` 
      }
    ];
  
    patients = [
      { name: 'Rahul Sharma', gender: 'M', email: 'rahul@example.com', mobile: '9876543210', status: 'Pending' },
      { name: 'Priya Verma', gender: 'F', email: 'priya@example.com', mobile: '9123456789', status: 'Pending' },
      { name: 'Amit Kumar', gender: 'M', email: 'amit@example.com', mobile: '9012345678', status: 'Complete' }
    ];
    
    visitDoctorForm!: FormGroup;
    availableDates = [
      { date: '2025-03-10' },
      { date: '2025-03-15' },
      { date: '2025-03-20' }
    ];
    
  
    constructor(private rest: RestService, private fb: FormBuilder) {
      this.visitDoctorForm = this.fb.group({
        visitCampPlace: ['', Validators.required],
        visitDate: ['', Validators.required],  // ✅ Single Date Field
        timeFrom: ['', Validators.required],
        timeTo: ['', Validators.required],
        patientFee: ['', [Validators.required, Validators.min(1)]]
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
      this.visitDoctor = this.rest.userData?.data.visitDetails[0];
      if(this.visitDoctor){
        this.patchValue(this.visitDoctor);
        this.staff = this.existData.staff ? this.existData.staff : [];
      }
    }
  
    patchValue(events:any){
      this.visitDoctorForm = this.fb.group({
        visitCampPlace: [events.visitCampPlace, Validators.required],
        visitDate: [events.visitDate, Validators.required],  // ✅ Single Date Field
        timeFrom: [events.timeFrom, Validators.required],
        timeTo: [events.timeTo, Validators.required],
        patientFee: [events.patientFee, [Validators.required, Validators.min(1)]]
      });
    }
  
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  
    showContent(path: string) {
      this.show = path;
    }
  
    addDoctor() {
      console.log(this.doctorForm);
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
        this.rest.addEventStaff(data).subscribe((res:any)=>{
          this.existData = res.data;
          this.staff = this.existData.staff;
          this.staffForm.reset();
        })
      }
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

    onSubmit() {
      if (this.visitDoctorForm.valid) {
        const data =  {
          data: {
            ...this.existData,
            visitDetails: [this.visitDoctorForm.value]
          }
        };
        this.rest.addVisitDoctor(data).subscribe((res:any)=>{
          this.existData = res.data;
          this.visitDoctor = this.existData.visitDetails[0];
          this.patchValue(this.visitDoctor);
        });
      } else {
        alert('Please fill in all required fields!');
      }
    }
}
