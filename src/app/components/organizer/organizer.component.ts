import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { TosterService } from '../../core/toster/toster.service';
import { LoaderComponent } from '../loader/loader.component';

interface Event {
  _id:string,
  eventName: string;
  eventPlace: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  doctors:Doctor[],
  staff:Staff[]
}

interface Doctor {
  _id:string;
  name: string;
  address: string;
  mobile: string;
  pass: string;
  patient:any[]
}

interface Staff {
  _id:string;
  name: string;
  address: string;
  mobile: string;
  pass: string;
}

@Component({
  selector: 'app-organizer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventFormComponentComponent, LoaderComponent],
  templateUrl: './organizer.component.html',
  styleUrl: './organizer.component.scss',
})
export class OrganizerComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  selectedCity: any;
  show!: string;

  eventForm!: FormGroup;
  doctorForm!: FormGroup;
  staffForm!: FormGroup;

  events!: Event;
  doctors: Doctor[] = [];
  staff: Staff[] = [];

  showDoctorForm = false;
  showStaffForm = false;
  existData:any;
  loggedIn!:boolean;

  buttons:any[]=[
    {
      name:"Camp Setting",
      active:true,
      notification:0,
      key:"camp"
    },
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
    { title: 'Total Doctors', value: 0 },
    { title: 'Total Staff', value: 0 },
    { title: 'Total Bookings', value: 0 },
    { title: 'Pending Bookings', value: 0 },
    { title: 'Completed Bookings', value: 0 },
    { title: 'Cancelled Bookings', value: 0 }
  ];

  patients:any = [];

  activeButton: string='camp';
  isEditDoctor!:Doctor | null;
  isEditstaff!:Staff | null;
  showDoctor!:Doctor;
  showStaff!:Staff;
  loader!:boolean;
  userData:any;
  isFirstLoad: boolean=true;

  

  constructor(private rest: RestService, private fb: FormBuilder, private auth:AuthService, private router:Router, private toster:TosterService) {
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
      password: ['', Validators.required],
      role:['OrganizerDoctor']
    });

    this.staffForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', Validators.required],
      role:['OrganizerStaff']
    });
  }

  ngOnInit(): void {
    this.loggedIn = this.auth.getAuth();
    this.userData = this.rest.userData;
    if(this.userData.role == 'Organizer'){
      this.show = 'dashboard';
      this.getDetails();
    }else if(this.userData.role == 'OrganizerDoctor'){
      this.showDoctor = this.userData;
      this.show = this.showDoctor.name;
      this.getAllPatientDetails(this.showDoctor._id);
    }else if(this.userData.role == 'OrganizerStaff'){
      this.showStaff = this.userData;
      this.getAllPatientDetails();
    }
  }

  getIsoString(date:any){
    const istOffset = 6.5 * 60 * 60 * 1000;
    return new Date(date).getTime() + istOffset;
  }

  getDetails(){
    this.loader = true;
    this.rest.geUsertDetails().subscribe(
      {
        next:(res:any)=>{
          this.loader = false;
          this.events = res[0];
          if(res){
            this.patchValue(this.events);
            this.doctorForm.reset();
            this.staffForm.reset();
            this.doctors = this.events.doctors;
            this.staff = this.events.staff;
            this.loader = false;
            if(this.doctors.length > 0 || this.staff.length > 0){
              this.updateDashboardData(this.doctors,this.staff);
            }
          }
        },
        error:(err:any)=>{
          this.loader = false;
          this.toster.showError("Failed Fetching Events!",err.error.message)
        }
      }
    )
  } 

  getPatientDetails(visitId:any, serviceId:any=''){
    this.loader = true;
    this.patients = [];
    this.rest.getPatientList(visitId,serviceId).subscribe(
      {
        next:(res:any)=>{
          this.loader = false;
          this.patients = res;
          if(this.userData.role == 'Organizer'){
            this.updateDashboardData(this.doctors,this.staff);
          }
        },
        error:(err:any)=>{
          this.loader = false;
          this.toster.showError(err.error.message," Patients Not Found!");
        }
      }
    )
  }

  getAllPatientDetails(visitId?:any){
    this.loader = true;
    this.patients = [];
    this.rest.getAllPatients(visitId,'organizer').subscribe(
      {
        next:(res:any)=>{
          this.patients = res;
          this.loader = false;
          if(this.userData.role == 'Organizer'){
            this.updateDashboardData(this.doctors,this.staff);
          }
        },
        error:(err:any)=>{
          this.loader = false;
          this.toster.showError(err.error.message," Patients Not Found!");
        }
      }
    )
  }

  updateDashboardData(doctor:Doctor[], staff:Staff[]) {
    // Flatten all patient arrays from doctors into one array

    if (this.isFirstLoad && this.events?._id) {
      this.getServicePatient();
      this.isFirstLoad = false;
    }
  
    // Update dashboard data
    this.dashboardData = this.dashboardData.map((item) => {
      if (item.title === 'Total Doctors') {
        return { ...item, value: doctor.length };
      } else if (item.title === 'Total Bookings') {
        return { ...item, value: this.patients.length };
      } else if(item.title === 'Total Staff'){
        return { ...item, value: staff.length };
      }else if(item.title === 'Pending Bookings'){
        return { ...item, value: this.patients.filter((p:any)=> p.bookEvents[0].status === 'Pending').length };
      }
      else if(item.title === 'Completed Bookings'){
        return { ...item, value: this.patients.filter((p:any) => p.bookEvents[0].status === 'Completed').length };
      }
      else if(item.title === 'Cancel Bookings'){
        return { ...item, value: this.patients.filter((p:any) => p.bookEvents[0].status === 'Cancel').length };
      }
      return item;
    });
  }
  

  patchValue(events:any){
    this.eventForm = this.fb.group({
      eventName: [events.eventName, Validators.required],
      eventPlace: [events.eventPlace, Validators.required],
      eventDate: [new Date(events.eventDate).toISOString().split('T')[0], Validators.required],
      startTime: [this.isoToTimeString(events.startTime), Validators.required],
      endTime: [this.isoToTimeString(events.endTime), Validators.required],
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

  showContent(path: string, isdDoctor?:any) {
    this.show = path;
    if(isdDoctor.role === 'OrganizerDoctor'){
      this.showDoctor = isdDoctor;
      this.getPatientDetails(this.showDoctor._id,this.events._id);
    }else{
      this.showStaff = isdDoctor;
      this.getServicePatient();
    }
  }

  getServicePatient(){
    this.rest.getAllservicePatients(this.events._id).subscribe(
      {
        
        next:(res:any)=>{
          this.patients = res;
          this.loader = false;
          if(this.userData.role == 'Organizer'){
            this.updateDashboardData(this.doctors,this.staff);
          }
        },
        error:(err:any)=>{
          this.loader = false;
          this.toster.showError(err.error.message," Patients Not Found!");
        }
    })
  }

  resetDoctor(){
    this.doctorForm.reset();
    this.isEditDoctor = null;
  }

  editDoctorValue(doctor:any){
    this.isEditDoctor = doctor;
    this.doctorForm = this.fb.group({
      name: [doctor.name, Validators.required],
      address: [doctor.address, Validators.required],
      mobile: [doctor.mobile, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: [doctor.password, Validators.required],
    });
  }

  editStaffValue(staff:any){
    this.isEditstaff = staff;
    this.staffForm = this.fb.group({
      name: [staff.name, Validators.required],
      address: [staff.address, Validators.required],
      mobile: [staff.mobile, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: [staff.password, Validators.required],
      role:['OrganizerStaff']
    });
  }

  resetStaff(){
    this.staffForm.reset();
    this.isEditstaff = null;
  }

  addEvent() {
    if (this.eventForm.valid) {
      this.loader = true;
      this.eventForm.get('startTime')?.setValue(`${this.eventForm.value.eventDate}T${this.eventForm.value.startTime}:00.000Z`);
      this.eventForm.get('endTime')?.setValue(`${this.eventForm.value.eventDate}T${this.eventForm.value.endTime}:00.000Z`);
      const data = this.eventForm.value
      this.rest.addEvent(data).subscribe(
        {
          next:(res:any)=>{
            if(res){
              this.getDetails();
              this.toster.showSuccess("Event Added Successfully!","Event Added.");
            }
          },
          error:(err:Error)=>{
            this.loader = false;
            this.toster.showError(err.message,"Failed Adding Event");
          }
        }
      );
      this.showDoctorForm = true;
    }
  }

  updateEvent() {
    if (this.eventForm.valid) {
      this.loader = true;
      this.eventForm.get('startTime')?.setValue(`${this.eventForm.value.eventDate}T${this.eventForm.value.startTime}:00.000Z`);
      this.eventForm.get('endTime')?.setValue(`${this.eventForm.value.eventDate}T${this.eventForm.value.endTime}:00.000Z`);
      const data = this.eventForm.value
      this.rest.updateEvent(data, this.events._id).subscribe(
        {
          next:(res:any)=>{
            if(res){
              this.getDetails();
              this.toster.showSuccess("Event Updated Successfully!", "Event Updated!!");
            }
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError("Event Updated Failed!",err.error.message)
          }
        }
      );
      this.showDoctorForm = true;
    }
  }

  addDoctor() {
    if(!this.events){alert("Please add Event First!!"); return}
    if (this.doctorForm.valid) {
      this.loader = true;
      const data = this.doctorForm.value;
      data.role = "OrganizerDoctor";
      this.rest.addEventDoctor(data, this.events._id).subscribe( {
        next:(res:any)=>{
          if(res){
            this.getDetails();
            this.toster.showSuccess("Doctor Added to organizer camp Successfully!","Doctor Added!!")
          }
        },
        error:(err:any)=>{
          this.loader = false;
          this.toster.showError("Failed to Add Doctor!",err.error.message);
        }
      })
    }
  }

  editDoctor() {
    if (this.doctorForm.valid) {
      this.loader = true;
      const data = {
        name:this.doctorForm.value.name,
        address:this.doctorForm.value.address,
      };
      this.rest.editEventDoctor(data, this.events._id, this.isEditDoctor?._id ).subscribe( {
        next:(res:any)=>{
          if(res){
            this.doctorForm.reset();
            this.isEditDoctor = null;
            this.getDetails();
            this.toster.showSuccess("Doctor Changes Are edited Successfully!","Edited Successfully!");
          }
        },
        error:(err:any)=>{
          this.loader = false;
          this.toster.showError("Error Editing Doctor!",err.error.message);
        }
      })
    }
  }

  addStaff() {
    if(!this.events){alert("Please add Event First!!"); return};
    if (this.staffForm.valid) {
      this.loader = true;
      const data = this.staffForm.value
      data.role = 'OrganizerStaff'
      this.rest.addEventStaff(data,this.events._id).subscribe(
        {
          next:(res:any)=>{
            this.staffForm.reset();
            this.getDetails();
            this.toster.showSuccess("Staff Added to organizer camp Successfully!","Staff Added!!")
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError("Failed to Add Staff!",err.error.message)
          }
        }
      )
    }
  }

  editStaff() {
    if (this.staffForm.valid) {
      this.loader = true;
      const data = {
        name:this.staffForm.value.name,
        address:this.staffForm.value.address
      };
      this.rest.editEventStaff(data,this.events._id, this.isEditstaff?._id).subscribe(
        {
          next:(res:any)=>{
            this.isEditstaff = null;
            this.staffForm.reset();
            this.getDetails();
            this.toster.showSuccess("Staff Changes Are edited Successfully!","Edited Successfully!");
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError("Error Editing Staff!",err.error.message);
          }
        }
      )
    }
  }

  deleteDoctor(doctor:any) {
    this.loader = true;
    this.rest.deleteDoctor(doctor._id,this.events._id).subscribe({
      next:(res:any)=>{
        this.isEditDoctor = null;
        this.doctorForm.reset();
        this.getDetails();
        this.toster.showSuccess("Doctor is deleted Successfully!","Deleted Successfully!");
      },
      error:(err:any)=>{
        this.loader = false;
        this.toster.showError("Error Deleting Doctor!",err.error.message);
      }
    })
  }

  deleteStaff(staff:any) {
    this.loader = true;
    this.rest.deleteStaff(staff._id,this.events._id).subscribe({
      next:(res:any)=>{
        this.isEditstaff = null;
        this.staffForm.reset();
        this.getDetails();
        this.toster.showSuccess("Staff Changes Are Deleted Successfully!","Deleted Successfully!");
      },
      error:(err:any)=>{
        this.loader = false;
        this.toster.showError("Error Deleting Doctor!",err.error.message)
      }
    })
  }

  // Toggle Status (Pending <-> Complete)
  toggleStatus(res:any,status:string, service?:any) {
    this.loader = true;
    const data = {
      status:status,
      bookingDate:res.bookEvents[0].bookingDate
    }

    this.rest.patientStatus(res,'organizer',data).subscribe(
      {
        next:(res:any)=>{
          this.loader = false;
          this.toster.showSuccess("Successfully Changes the patient Status","Success!")
          if(this.userData.role !== 'Organizer'){
            this.getAllPatientDetails(service._id);
          }else{
            this.getPatientDetails(service._id,this.events._id);
          }
        },
        error:(err:any)=>{
          this.loader = false;
          this.toster.showError("Failed to Change the patient Status",err.error.message);
          if(this.userData.role !== 'Organizer'){
            this.getAllPatientDetails(service._id);
          }else{
            this.getPatientDetails(service._id,this.events._id);
          }
        }
      }
    )
  }

  redirectToHome(){
    this.router.navigate(['user']);
  }

  redirect(path:string){
    if(path == 'login'){
      this.auth.removeAuth();
    }
    this.router.navigate([path]);
  }

  toggleActiveButton(selectedKey: string) {
    this.activeButton = selectedKey;
    this.buttons.forEach(button => {
      button.active = button.key === selectedKey;
    });
  }

  refresh(){
    this.getDetails();
  }

  ngOnDestroy(): void {
    this.auth.removeAuth();
  }
}
