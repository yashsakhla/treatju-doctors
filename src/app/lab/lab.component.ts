import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.scss'
})
export class LabComponent {
  isSidebarOpen = true;
  show: string = 'dashboard';
  services: { name: string }[] = [];
  dashboardData = [
    { title: 'Total Staff', value: 10 },
    { title: 'Total Bookings', value: 120 },
    { title: 'Pending', value: 15 },
    { title: 'Completed', value: 90 },
    { title: 'Cancelled', value: 15 },
    { title: 'Fee Collection', value: '₹50,000' },
    { title: 'Admin Revenue', value: '₹50 per Patient' }
  ];

  clinicForm: FormGroup;
  scheduleForm: FormGroup;
  serviceForm: FormGroup;
  staffForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clinicForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required]
    });

    this.scheduleForm = this.fb.group({
      schedule1From: [''],
      schedule1To: [''],
      schedule2From: [''],
      schedule2To: ['']
    });

    this.serviceForm = this.fb.group({
      serviceName: ['', Validators.required],
      fee: ['', Validators.required]
    });

    this.staffForm = this.fb.group({
      name: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^\d{10}$')]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showContent(section: string) {
    this.show = section;
  }

  showServicePatients(serviceName: string) {
    console.log('Viewing patients for service:', serviceName);
  }

  saveClinic() {
    if (this.clinicForm.valid) {
      console.log('Clinic Data Saved:', this.clinicForm.value);
    }
  }

  saveSchedule() {
    if (this.scheduleForm.valid) {
      console.log('Schedule Data Saved:', this.scheduleForm.value);
    }
  }

  addService() {
    if (this.serviceForm.valid) {
      this.services.push({ name: this.serviceForm.value.serviceName });
      console.log('Service Added:', this.serviceForm.value);
      this.serviceForm.reset();
    }
  }

  addStaff() {
    if (this.staffForm.valid) {
      console.log('Staff Added:', this.staffForm.value);
      this.staffForm.reset();
    }
  }
}
