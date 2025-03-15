import { Component } from '@angular/core';


import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EventFormComponentComponent } from '../event-form-component/event-form-component.component';
import { RestService } from '../../core/rest/rest.service';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { TosterService } from '../../core/toster/toster.service';

interface Staff {
  name: string;
  address: string;
  mobile: string;
  password: string;
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
    loggedIn!:boolean;
  

    buttons:any[]=[
      {
        name:"Doctors",
        active:false,
        notification:0,
        key:"doctors"
      },
      {
        name:"Staff",
        active:false,
        notification:0,
        key:"staff"
      },
    ]
  
    dashboardData = [
      { title: 'Total Staff', value: 0 },
      { title: 'Total Bookings', value: 0 },
      { title: 'Pending Bookings', value: 0},
      { title: 'Completed Bookings', value:0},
      { title: 'Cancelled Bookings', value: 0 },
      { title: 'Fee Collection', value: `₹${0}` },
      { 
        title: 'Admin Revenue (20%)', 
        value: `₹${(0).toFixed(2)}` 
      }
    ];
  
    patients:any[] = []
    
    visitDoctorForm!: FormGroup;
    availableDates = [
      { date: '2025-03-10' },
      { date: '2025-03-15' },
      { date: '2025-03-20' }
    ];
  userData: any;
  activeButton: string='doctors';
  showStaff: any;
  loader!: boolean;
  visitDetails:any;
  isEditstaff: any;
  
    constructor(private rest: RestService, private fb: FormBuilder, private auth :AuthService, private router:Router, private toster:TosterService) {
      this.visitDoctorForm = this.fb.group({
        visitName:['Dummy Visit'],
        visitPlace: ['', Validators.required],
        eventDate: ['', Validators.required],  // ✅ Single Date Field
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
        doctorFee: ['', [Validators.required]]
      });

      this.staffForm = this.fb.group({
        name: ['', Validators.required],
        address: ['', Validators.required],
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        password: ['', Validators.required],
      });
    }
  
    ngOnInit(): void {
      this.loggedIn = this.auth.isUserLoggedIn;
      this.userData = this.rest.userData;
      this.visitDoctor = this.userData;
      if(this.userData.role == 'VisitDoctor'){
        this.show = 'dashboard'
        this.getDetails();
      }else if(this.userData.role == 'VisitDoctorStaff'){
        this.showStaff = this.userData.staff;
      }
    }

    getDetails(){
      this.rest.getVisitDoctorDetails().subscribe(
        {
          next:(res:any)=>{
            this.visitDetails = res[0];
            this.patchValue(this.visitDetails);
            this.patients = this.visitDetails.patients;
            this.staff = this.visitDetails.staff;
            this.updateDashboardData(this.staff);
          }
        }
      ) 
    }


    updateDashboardData(staff:Staff[]) {

      // Flatten all patient arrays from doctors into one array
      this.patients = this.visitDoctor.patient;
    
      // Update dashboard data
      this.dashboardData = this.dashboardData.map((item) => {
       if (item.title === 'Total Bookings') {
          return { ...item, value: this.patients.length }; // Assuming patients represent bookings
        } else if(item.title === 'Total Staff'){
          return { ...item, value: staff.length };
        }else if(item.title === 'Pending Bookings'){
          return { ...item, value: this.patients.filter(p => p.status === 'Pending').length };
        }
        else if(item.title === 'Completed Bookings'){
          return { ...item, value: this.patients.filter(p => p.status === 'Completed').length };
        }
        else if(item.title === 'Cancel Bookings'){
          return { ...item, value: this.patients.filter(p => p.status === 'Cancel').length };
        }else if(item.title === 'Admin Revenue (20%)'){
          return { ...item, value: this.patients.filter(p => p.status === 'Completed').length * this.visitDoctor.fee * 0.2 };
        }
        return item;
      });
    }

    toggleActiveButton(selectedKey: string) {
      this.activeButton = selectedKey;
      this.buttons.forEach(button => {
        button.active = button.key === selectedKey;
      });
    }
  
    patchValue(events:any){
      this.visitDoctorForm = this.fb.group({
        visitPlace: [events.visitPlace, Validators.required],
        eventDate: [new Date(events.eventDate).toISOString().split('T')[0], Validators.required],  // ✅ Single Date Field
        startTime: [this.isoToTimeString(events.startTime), Validators.required],
        endTime: [this.isoToTimeString(events.endTime), Validators.required],
        doctorFee: [events.patientFee, [Validators.required, Validators.min(1)]]
      });
    }

    isoToTimeString(isoString: string): string {
      if (!isoString) return '';
      const date = new Date(isoString);
      return date.toISOString().substring(11, 16); // Extract HH:mm
    }
  
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  
    showContent(path: string) {
      this.show = path;
    }
  
    addStaff() {
      const data = this.staffForm.value;
      data.role = "VisitDoctorStaff";
      this.rest.addVisitDocStaff(data,this.visitDetails).subscribe(
        {
          next:()=>{
            this.getDetails();
          },
          error:()=>{

          }
        }
        
      )
    }
  
    deleteStaff(staff:any) {
      this.rest.deleteVisitStaff(this.visitDetails._id,staff._id).subscribe(
        {
          next:(res:any)=>{

          },
          error:()=>{

          }
        }
      )
    }

    updateVisit(){
      const data = this.visitDoctorForm.value;
      this.rest.updateVisitDoctor(this.visitDetails._id,data).subscribe(
        {
          next:(res:any)=>{

          },
          error:()=>{

          }
        }
      )
    }
  
    // Toggle Status (Pending <-> Complete)
    toggleStatus(index: number) {
      this.patients[index].status = this.patients[index].status === 'Pending' ? 'Complete' : 'Pending';
    }
  
    // Remove Patient from List
    removePatient(index: number) {
      
    }

    editStaffValue(staff:any){
      this.isEditstaff = staff;
      this.staffForm = this.fb.group({
      name: [staff.name, Validators.required],
      address: [staff.address, Validators.required],
      mobile: [staff.mobile, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: [staff.password, Validators.required],
    });
    }

    updateStaff(){
      this.isEditstaff = null;
      const data = this.staffForm.value;
      this.rest.updateVisitDocStaff(this.visitDetails._id, this.isEditstaff._id,data).subscribe(
        {
          next:(res:any)=>{

          },
          error:()=>{

          }
        }
      )
    }

    deleteVisit(){
      this.rest.deleteVisitDoc(this.visitDetails._id).subscribe(
        {
          next:(res:any)=>{

          },
          error:()=>{

          }
        }
      )
    }

    resetStaff(){
      this.staffForm.reset();
      this.isEditstaff = null;
    }

    onSubmit() {
      if (this.visitDoctorForm.valid) {
        this.visitDoctorForm.get('startTime')?.setValue(`${this.visitDoctorForm.value.eventDate}T${this.visitDoctorForm.value.startTime}:00.000Z`);
        this.visitDoctorForm.get('endTime')?.setValue(`${this.visitDoctorForm.value.eventDate}T${this.visitDoctorForm.value.endTime}:00.000Z`);
        this.visitDoctorForm.get('eventDate')?.setValue(new Date(this.visitDoctorForm.value.eventDate).toISOString());
        const data = this.visitDoctorForm.value;
        this.rest.addVisitDoctor(data).subscribe((res:any)=>{
          this.getDetails()
        });
      } else {
        alert('Please fill in all required fields!');
      }
    }
    
  redirect(path:string){
    this.router.navigate([path]);
  }
}
