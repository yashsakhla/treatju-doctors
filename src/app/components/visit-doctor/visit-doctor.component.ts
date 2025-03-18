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
import { LoaderComponent } from '../loader/loader.component';

interface Staff {
  name: string;
  address: string;
  mobile: string;
  password: string;
}

@Component({
  selector: 'app-visit-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventFormComponentComponent, LoaderComponent],
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
        this.showStaff = this.userData;
        this.show = this.showStaff.name;
        this.getAllPatientDetails();
      }
    }

    getDetails(){
      this.rest.getVisitDoctorDetails().subscribe(
        {
          next:(res:any)=>{
            if(res.length > 0){
              this.visitDetails = res[0];
            this.patchValue(this.visitDetails);
            this.staff = this.visitDetails.staff;
            this.getAllPatientDetails(this.visitDetails._id);
            this.updateDashboardData(this.staff);
            }else{
              this.visitDetails = []
            }
          }
        }
      ) 
    }
    getAllPatientDetails(visitId?:any){
      this.loader = true;
      this.rest.getPatientList(this.visitDoctor._id,visitId).subscribe(
        {
          next:(res:any)=>{
            this.patients = res;
            this.loader = false;
          },
          error:()=>{
            this.toster.showError("Error Fetching Patinets!","Please contact Admin!!")
            this.loader = false;
          }
        }
      )
    }

    getPatients(){
      this.loader = true;
      this.rest.getAllPatients().subscribe(
        {
          next:(res:any)=>{
            this.patients = res;
            this.loader = false;
          },
          error:()=>{
            this.toster.showError("Error Fetching Patinets!","Please contact Admin!!")
            this.loader = false;
          }
        }
      )
    }


    updateDashboardData(staff:Staff[]) {
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
        doctorFee: [events.doctorFee, [Validators.required, Validators.min(1)]]
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
  
    showContent(path: string, staff?:any) {
      this.show = path;
      if(staff){this.showStaff = staff; this.getAllPatientDetails(this.visitDetails._id);};
    }
  
    addStaff() {
      this.loader = true;
      const data = this.staffForm.value;
      data.role = "VisitDoctorStaff";
      this.rest.addVisitDocStaff(data,this.visitDetails).subscribe(
        {
          next:()=>{
            this.toster.showSuccess("You have Successfully Added New Staff to your Visit!","Staff Added!!")
            this.getDetails();
          },
          error:()=>{
            this.loader = false;
            this.toster.showError("There is error in adding your staff,Please contact admin","Error Adding Staff!")
          }
        }
        
      )
    }
  
    deleteStaff(staff:any) {
      this.loader = true;
        this.rest.deleteVisitStaff(this.visitDetails._id, staff._id).subscribe(
          {
            next:(res:any)=>{
              if(res){
                this.getDetails();
                this.toster.showSuccess("You have successfully Deleted your Staff!!","Deleted Successfully!")
              }
            },
            error:()=>{
              this.loader = false;
              this.toster.showError("There is Error in Deleting this Staff, Please contact admin","Error In Deleting!!")
            }
          }
        )
    }

    updateVisit(){
      if (this.visitDoctorForm.valid) {
        this.loader = true;
        this.visitDoctorForm.get('startTime')?.setValue(`${this.visitDoctorForm.value.eventDate}T${this.visitDoctorForm.value.startTime}:00.000Z`);
        this.visitDoctorForm.get('endTime')?.setValue(`${this.visitDoctorForm.value.eventDate}T${this.visitDoctorForm.value.endTime}:00.000Z`);
        this.visitDoctorForm.get('eventDate')?.setValue(new Date(this.visitDoctorForm.value.eventDate).toISOString());
        const data = this.visitDoctorForm.value;
        this.rest.updateVisitDoctor(this.visitDetails._id,data).subscribe(
          {
            next:(res:any)=>{
              this.toster.showSuccess("You have Successfully updated your Visit","Visit Updated!!")
              this.getDetails();
            },
            error:()=>{
              this.loader = false;
              this.toster.showError("Error in updating Visit, Please contact Admin","Visit updation Failed!!")
            }
          }
        );
      } else {
        alert('Please fill in all required fields!');
      }
    }
  
    toggleStatus(res:any,status:string) {
      this.loader = true;
      const data = {
        status:status,
        bookingDate:res.bookEvents[0].bookingDate
      }

      this.rest.patientStatus(res,'visit-doctor',data).subscribe(
        {
          next:(res:any)=>{
            this.loader = false;
            this.toster.showSuccess("Successfully Changes the patient Status","Success!")
            this.getAllPatientDetails(this.visitDetails._id);
          },
          error:()=>{
            this.loader = false;
            this.toster.showError("Failed to Change the patient Status","Failed!");
            this.getAllPatientDetails(this.visitDetails._id);
          }
        }
      )
    }
  
    redirectToHome(){
      this.router.navigate(['user']);
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
      if (this.staffForm.valid) {
        this.loader = true;
        const data = {
          name:this.staffForm.value.name,
          address:this.staffForm.value.address
        };
        this.rest.updateVisitDocStaff(this.visitDetails._id,this.isEditstaff._id,data).subscribe(
          {
            next:(res:any)=>{
              this.isEditstaff = null;
              this.staffForm.reset();
              this.toster.showSuccess("You have Successfully updated your Staff","Staff Updated!!")
              this.getDetails();
            },
            error:()=>{
              this.loader = false;
              this.toster.showError("Error in updating Staff, Please contact Admin","Visit updation Failed!!")
            }
          }
        );
      } else {
        alert('Please fill in all required fields!');
      }
    }

    deleteVisit(){
      if(this.patients.length < 1){
        this.loader = true;
        this.rest.deleteVisitDoc(this.visitDetails._id).subscribe(
          {
            next:(res:any)=>{
              if(res){
                this.getDetails();
                this.toster.showSuccess("You have successfully Deleted your Visit!!","Deleted Successfully!")
              }
            },
            error:()=>{
              this.loader = false;
              this.toster.showError("There is Error in Deleting this Visit, Please contact admin","Error In Deleting!!")
            }
          }
        )
      }else{
        this.toster.showInfo("You can not delete this visit as"+ this.patients.length+"patients already Booked","Can Not Delete This Visit!")
      }
      
    }

    resetStaff(){
      this.staffForm.reset();
      this.isEditstaff = null;
    }

    onSubmit() {
      if (this.visitDoctorForm.valid) {
        this.loader = true;
        this.visitDoctorForm.get('startTime')?.setValue(`${this.visitDoctorForm.value.eventDate}T${this.visitDoctorForm.value.startTime}:00.000Z`);
        this.visitDoctorForm.get('endTime')?.setValue(`${this.visitDoctorForm.value.eventDate}T${this.visitDoctorForm.value.endTime}:00.000Z`);
        this.visitDoctorForm.get('eventDate')?.setValue(new Date(this.visitDoctorForm.value.eventDate).toISOString());
        const data = this.visitDoctorForm.value;
        this.rest.addVisitDoctor(data).subscribe(
          {
            next:(res:any)=>{
              this.toster.showSuccess("You have Successfully added your Visit","Visit Added!!")
              this.getDetails();
            },
            error:()=>{
              this.loader = false;
              this.toster.showError("Error in adding Visit, Please contact Admin","Visit Failed!!")
            }
          }
        );
      } else {
        alert('Please fill in all required fields!');
      }
    }
    
  redirect(path:string){
    this.router.navigate([path]);
  }
}
