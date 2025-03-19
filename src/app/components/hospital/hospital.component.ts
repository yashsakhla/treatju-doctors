import { Component, OnInit } from '@angular/core';


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
  selector: 'app-hospital',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventFormComponentComponent, LoaderComponent],
  templateUrl: './hospital.component.html',
  styleUrl: './hospital.component.scss'
})
export class HospitalComponent implements OnInit {
    isSidebarOpen = true;
    selectedCity: any;
    show: string = 'dashboard';
  
    hospitalForm!: FormGroup;
    staffForm!: FormGroup;

    hospital:any;
    staff: Staff[] = [];
  
    showhospitalForm = false;
    showStaffForm = false;
    loggedIn!:boolean;
  

    buttons:any[]=[
      {
        name:"hospital",
        active:false,
        notification:0,
        key:"hospital"
      },
      {
        name:"Doctors",
        active:false,
        notification:0,
        key:"doctors"
      },
      {
        name:"services",
        active:false,
        notification:0,
        key:"services"
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
    
    visithospitalForm!: FormGroup;
    doctorForm!:FormGroup;
    userData: any;
    activeButton: string='services';
    showStaff: any;
    loader!: boolean;
    serviceDetails!:any[];
    doctors!:any[];
    isEditstaff: any;
    isEditService: any;
    isEditDoctor:any;
  showDoctor: any;
  showService: any;
  
    constructor(private rest: RestService, private fb: FormBuilder, private auth :AuthService, private router:Router, private toster:TosterService) {
      this.visithospitalForm = this.fb.group({
        name: ['', Validators.required],
        fee: ['', [Validators.required]]
      });

      this.doctorForm = this.fb.group({
        name: ['', Validators.required],
        address: ['', Validators.required],
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        password: ['', Validators.required],
        service:['',Validators.required],
        role:['HospitalDoctor']
      });

      this.hospitalForm = this.fb.group({
        startTime: ['', Validators.required],
        endTime: ['', [Validators.required]]
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
      this.hospital = this.userData;
      this.getAllPatientDetails(this.hospital._id);
      if(this.userData.role == 'Hospital'){
        this.show = 'dashboard'
        this.getDetails();
      }else if(this.userData.role == 'HospitalDoctor'){
        this.showDoctor = this.userData;
        this.show = this.showDoctor.name;
        this.getPatientDetails(this.hospital._id,this.showDoctor._id);
      }else if(this.userData.role == 'HospitalStaff'){
        this.showStaff = this.userData;
        this.show = this.showStaff.name;
        this.getPatientDetails(this.hospital._id,this.showStaff._id);
      }
    }

    getDetails(){
      this.rest.gethospitalDetails().subscribe(
        {
          next:(res:any)=>{
            this.loader = false;
            this.hospital = res;
            this.serviceDetails = res.availableServices;
            this.staff = res.staff;
            this.doctors = res.doctors;
            this.updateDashboardData(this.staff);
          },
          error:()=>{
            this.loader = false;
          }
        }
      ) 
    }

    getPatientDetails(visitId:any, serviceId:any=''){
      this.loader = true;
      this.rest.getPatientList(visitId,serviceId).subscribe(
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

    getAllPatientDetails(visitId:any){
      this.loader = true;
      this.rest.getAllPatients(visitId,'hospital').subscribe(
        {
          next:(res:any)=>{
            this.patients = res;
            this.loader = false;
          },
          error:()=>{
            this.toster.showError("Error Fetching Patinets!","Please contact Admin!!")
            this.loader = false;
            this.patients = [];
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
          return { ...item, value: this.patients.filter(p => p.status === 'Completed').length * this.hospital.fee * 0.2 };
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
      this.visithospitalForm = this.fb.group({
        name: [events.name, Validators.required],
        fee: [events.fee, [Validators.required, Validators.min(1)]]
      });
    }

    patchhospitalvalue(hospital:any){
      this.hospitalForm = this.fb.group({
        startTime: [hospital.startTime, Validators.required],
        endTime: [hospital.endTime, [Validators.required]]
      });
    }
  
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  
    showContent(path: string, data?:any) {
      this.show = path;
      if(data.role == "HospitalDoctor"){
        this.showDoctor = data;
      }else if(data.role == "HospitalStaff"){
        this.showStaff = data;
        this.getAllPatientDetails(this.hospital._id);
      }else{
        this.showService = data;
        this.getPatientDetails(this.hospital._id,this.showService._id);
      }
    }

    updateSchedule(){
      const payload = this.hospitalForm.value;
      this.loader = true;
      this.rest.updatehospitalSchedule(payload).subscribe(
        {
          next:()=>{
            this.getDetails();
            this.toster.showSuccess("Schdule updated!!","your hospital Daily Schdule is Updated successfully!")
          },
          error:(err:Error)=>{
            this.loader = false;
            this.toster.showError("updating Schedule failed!!", err.message);
          }
        }
      )
    }

    addDoctor() {
      console.log(this.doctorForm.value)
      if (this.doctorForm.valid) {
        this.loader = true;
        const data = this.doctorForm.value;
        data.mobile = Number(data.mobile);
        this.rest.addHospitalDoctor(data).subscribe( {
          next:(res:any)=>{
            if(res){
              this.getDetails();
              this.toster.showSuccess("Doctor Added to Hospital Successfully!","Doctor Added!!")
            }
          },
          error:()=>{
            this.loader = false;
            this.toster.showError("Failed to Add Doctor to Hospital, Check with Admin.","Failed to Add Doctor!")
          }
        })
      }else{
        alert("Please Check the Form!!");
      }
    }
  
    editDoctor() {
      if (this.doctorForm.valid) {
        this.loader = true;
        const data:any = {
          name:this.doctorForm.value.name,
          address:this.doctorForm.value.address,
        };
        this.rest.updateHospitalDoctor(data, this.hospital._id ).subscribe( {
          next:(res:any)=>{
            if(res){
              this.isEditDoctor = null;
              this.doctorForm.reset();
              this.getDetails();
              this.toster.showSuccess("Doctor Changes Are edited Successfully!","Edited Successfully!");
            }
          },
          error:()=>{
            this.loader = false;
            this.toster.showError("Error Editing Doctor Changes, Please contact admin.","Error Editing Doctor!")
          }
        })
      }else{
        alert("Please check the form values, and fill all the valid values!")
      }
    }

    deleteDoctor(doctor:any) {
      this.loader = true;
      this.rest.deleteDoctor(doctor._id,this.hospital._id).subscribe({
        next:(res:any)=>{
          this.isEditDoctor = null;
          this.doctorForm.reset();
          this.getDetails();
          this.toster.showSuccess("Doctor is deleted Successfully!","Deleted Successfully!");
        },
        error:()=>{
          this.loader = false;
          this.toster.showError("Error Deleting Doctor Changes, Please contact admin.","Error Deleting Doctor!")
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
        service:[doctor.service,Validators.required],
      });
    }
  
    addStaff() {
      this.loader = true;
      const data = this.staffForm.value;
      data.role = "HospitalStaff";
      this.rest.addHospitalStaff(data,this.hospital._id).subscribe(
        {
          next:()=>{
            this.staffForm.reset();
            this.getDetails();
            this.toster.showSuccess("Staff Added!","Your staff is added successfully for your hospital!!")
          },
          error:()=>{
            this.loader = false;
            this.toster.showError("Error Adding Staff!!","Adding Staff has failed, try again after sometime!")
          }
        }
        
      )
    }
  
    deleteStaff(staff:any) {
      this.loader = true;
      this.rest.deleteHospitalStaff(this.hospital._id,staff._id).subscribe(
        {
          next:()=>{
            this.isEditstaff = null;
            this.staffForm.reset();
            this.getDetails();
            this.toster.showSuccess("Staff Deleted!","Your staff is deleted successfully for your hospital!!")
          },
          error:()=>{
            this.loader = false;
            this.toster.showError("Error deletinig Staff!!","deleting Staff has failed, try again after sometime!")
          }
        }
      )
    }

    updatehospitalService(){
      if(this.visithospitalForm.valid){
        const data = this.visithospitalForm.value;
        data.serviceId = this.serviceDetails.find((res:any)=> res.name == data.service)._id;
      this.loader = true;
      this.rest.updatehospitalService(this.isEditService._id,data).subscribe(
        {
          next:()=>{
            this.isEditService = null;
            this.visithospitalForm.reset();
            this.getDetails();
            this.toster.showSuccess("Service updated!!","your hospital Service is Updated successfully!")
          },
          error:(err:Error)=>{
            this.loader = false;
            this.toster.showError("updating Service failed!!", err.message);
          }
        }
      )
      }else{
        alert("please check the from, and Fill all the valid values!")
      }
    }
  
    // Toggle Status (Pending <-> Complete)
    toggleStatus(res:any, status:string, service?:any) {
      this.loader = true;
      const data = {
        status:status,
        bookingDate:res.bookEvents[0].bookingDate
      }

      this.rest.patientStatus(res,'hospital',data).subscribe(
        {
          next:(res:any)=>{
            this.loader = false;
            this.toster.showSuccess("Successfully Changes the patient Status","Success!")
            if(service){
              this.getPatientDetails(this.hospital._id,service._id);
            }else{
              this.getAllPatientDetails(this.hospital._id);
            }
          },
          error:()=>{
            this.loader = false;
            this.toster.showError("Failed to Change the patient Status","Failed!");
            if(service){
              this.getPatientDetails(this.hospital._id,service._id);
            }else{
              this.getAllPatientDetails(this.hospital._id);
            }
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
      this.loader = true;
      const data = this.staffForm.value;
      this.rest.updateHospitalStaff(this.hospital._id, this.isEditstaff._id,data).subscribe(
        {
          next:()=>{
            this.isEditstaff = null;
            this.staffForm.reset();
            this.getDetails();
            this.toster.showSuccess("Staff updated!!","your hospital Staff is Updated successfully!")
          },
          error:(err:Error)=>{
            this.loader = false;
            this.toster.showError("updating Staff failed!!", err.message);
          }
        }
      )
    }

    deleteService(service:any){
      this.loader = true;
      this.rest.deleteHospitalService(service._id).subscribe(
        {
          next:()=>{
            this.isEditService = null;
            this.visithospitalForm.reset();
            this.getDetails();
            this.toster.showSuccess("Service Deleted!","Your hospital Service is deleted successfully for your hospital!!")
          },
          error:()=>{
            this.loader = false;
            this.toster.showError("Error deletinig service!!","deleting service has failed, try again after sometime!")
          }
        }
      )
    }

    editService(service:any){
      this.isEditService = service;
      this.patchValue(service);
    }

    resetServiceForm(){
      
      this.hospitalForm.reset();
    }

    resetStaff(){
      this.staffForm.reset();
      this.isEditstaff = null;
    }

    onSubmit() {
      if (this.visithospitalForm.valid) {
        const data = this.visithospitalForm.value;
        data.fee = Number(data.fee);
        this.loader = true;
        this.rest.addhospitalService(data).subscribe(
          {
            next:(res:any)=>{
              this.visithospitalForm.reset();
              this.toster.showSuccess("New Service Added!","Success");
              this.getDetails();
            },
            error:(err:Error)=>{
              this.loader = false;
              this.toster.showError("Error Adding service",err.message);
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
