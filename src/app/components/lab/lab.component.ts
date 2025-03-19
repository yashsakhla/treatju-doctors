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
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventFormComponentComponent, LoaderComponent],
  templateUrl: './lab.component.html',
  styleUrl: './lab.component.scss'
})
export class LabComponent implements OnInit {
    isSidebarOpen = true;
    selectedCity: any;
    show: string = 'dashboard';
  
    labForm!: FormGroup;
    staffForm!: FormGroup;

    lab:any;
    staff: Staff[] = [];
  
    showlabForm = false;
    showStaffForm = false;
    loggedIn!:boolean;
  

    buttons:any[]=[
      {
        name:"lab",
        active:false,
        notification:0,
        key:"lab"
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
      { title: 'Total Services', value: 0 },
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
  
    patients:any[] = [];
    
  visitlabForm!: FormGroup;
  userData: any;
  activeButton: string='services';
  showStaff: any;
  loader!: boolean;
  serviceDetails!:any[];
  isEditstaff: any;
  isEditService: any;
  showService: any;
  isFirstLoad: boolean = true;
  
    constructor(private rest: RestService, private fb: FormBuilder, private auth :AuthService, private router:Router, private toster:TosterService) {
      this.visitlabForm = this.fb.group({
        name: ['', Validators.required],
        fee: ['', [Validators.required]]
      });

      this.labForm = this.fb.group({
        startTime: ['', Validators.required],
        endTime: ['', [Validators.required]]
      });

      this.staffForm = this.fb.group({
        name: ['', Validators.required],
        address: ['', Validators.required],
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        password: ['', Validators.required],
        role:['LabStaff']
      });
    }
  
    ngOnInit(): void {
      this.loggedIn = this.auth.getAuth();
      this.userData = this.rest.userData;
      this.lab = this.userData;

      if(this.userData.role == 'Lab'){
        this.show = 'dashboard'
        this.getDetails();
      }else if(this.userData.role == 'LabStaff'){
        this.showStaff = this.userData;
        this.show = this.showStaff.name;
      }
    }

    getDetails(){
      this.rest.getlabDetails().subscribe(
        {
          next:(res:any)=>{
            this.loader = false;
            this.lab = res;
            this.serviceDetails = res.availableServices;
            this.staff = res.staff;
            this.patchLabvalue(this.lab);
            this.updateDashboardData(this.staff);
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"Error Fetching Lab!!")
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
            console.log(res);
            this.patients = res;
            this.loader = false;
          },
          error:(err:any)=>{
            this.toster.showError(err.error.message,"No patient Found!");
            this.loader = false;
          }
        }
      )
    }

    getAllPatientDetails(visitId:any){
      this.loader = true;
      this.rest.getAllPatients(visitId,'labs').subscribe(
        {
          next:(res:any)=>{
            this.patients = res;
            this.loader = false;
            if(this.userData.role == 'Lab'){
              this.updateDashboardData(this.staff);
            }
          },
          error:(err:any)=>{
            this.toster.showError(err.error.message,"No patient Found!");
            this.loader = false;
          }
        }
      )
    }

    getLabStatus(patient:any): string {
      const event = patient.bookEvents.find((res: any) => res._id === this.lab._id);
      return event ? event.status : 'Not Found'; // Default value if no match
    }


    updateDashboardData(staff:Staff[]) {
      // Update dashboard data
      if (this.isFirstLoad && this.lab?._id) {
        this.getAllPatientDetails(this.lab._id);
        this.isFirstLoad = false;
        return;
      }
      this.dashboardData = this.dashboardData.map((item) => {
       if (item.title === 'Total Bookings') {
          return { ...item, value: this.patients.length }; // Assuming patients represent bookings
        } else if(item.title === 'Total Services'){
          return { ...item, value: this.lab.availableServices.length };
        }else if(item.title === 'Total Staff'){
          return { ...item, value: staff.length };
        }else if (item.title === 'Total Bookings') {
          return { ...item, value: this.patients.length };
        }else if(item.title === 'Pending Bookings'){
          return { ...item, value: this.patients.filter(p => p.bookEvents[0].status === 'Pending').length };
        }
        else if(item.title === 'Completed Bookings'){
          return { ...item, value: this.patients.filter(p => p.bookEvents[0].status === 'Completed').length };
        }
        else if(item.title === 'Cancel Bookings'){
          return { ...item, value: this.patients.filter(p => p.bookEvents[0].status === 'Cancel').length };
        }else if(item.title === 'Admin Revenue (20%)'){
          return { ...item, value: '₹'+ (this.updateRevenue() * 0.2).toFixed(2) };
        }
        return item;
      });
    }

    updateRevenue() {
      const completedPatients = this.patients.filter(p => p.bookEvents[0].status === 'Completed');
    
          // Calculate total revenue based on service fees
          let totalRevenue = completedPatients.reduce((acc, patient) => {
            const serviceName = patient.bookEvents[0].serviceName; // Assuming service name exists in bookEvents
            const service = this.serviceDetails.find(s => s.name === serviceName); // Find matching service
            console.log(service);
            const serviceFee = service ? service.fee : 0; // Get fee, default to 0 if not found
            return acc + serviceFee;
          }, 0);
          return totalRevenue;
    }

    toggleActiveButton(selectedKey: string) {
      this.activeButton = selectedKey;
      this.buttons.forEach(button => {
        button.active = button.key === selectedKey;
      });
    }
  
    patchValue(events:any){
      this.visitlabForm = this.fb.group({
        name: [events.name, Validators.required],
        fee: [events.fee, [Validators.required, Validators.min(1)]]
      });
    }

    patchLabvalue(lab:any){
      this.labForm = this.fb.group({
        startTime: [lab.startTime, Validators.required],
        endTime: [lab.endTime, [Validators.required]]
      });
    }
  
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  
    showContent(path: string, data?:any) {
      this.show = path;
      if(data.role == "LabStaff"){
        this.showStaff = data;
        this.getAllPatientDetails(this.lab._id);
      }else{
        this.getPatientDetails(this.lab._id,data._id);
        this.showService = data;
      }
    }

    updateSchedule(){
      const payload = this.labForm.value;
      this.loader = true;
      this.rest.updateLabSchedule(payload).subscribe(
        {
          next:()=>{
            this.getDetails();
            this.toster.showSuccess("Schdule updated!!","your Lab Daily Schdule is Updated successfully!")
          },
          error:(err:Error)=>{
            this.loader = false;
            this.toster.showError("updating Schedule failed!!", err.message);
          }
        }
      )
    }
  
    addStaff() {
      this.loader = true;
      const data = this.staffForm.value;
      this.rest.addLabStaff(data).subscribe(
        {
          next:()=>{
            this.staffForm.reset();
            this.getDetails();
            this.toster.showSuccess("Staff Added!","Your staff is added successfully for your Lab!!")
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"Adding Staff has failed, try again after sometime!")
          }
        }
        
      )
    }
  
    deleteStaff(staff:any) {
      this.loader = true;
      this.rest.deleteLabStaff(this.lab._id,staff._id).subscribe(
        {
          next:()=>{
            this.isEditstaff = null;
            this.staffForm.reset();
            this.getDetails();
            this.toster.showSuccess("Staff Deleted!","Your staff is deleted successfully for your Lab!!")
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"deleting Staff has failed, try again after sometime!")
          }
        }
      )
    }

    updateLabService(){
      if(this.visitlabForm.valid){
        this.loader = true;
        const data = {
          name:this.visitlabForm.value.name,
          fee:Number(this.visitlabForm.value.fee)
        };
        this.rest.updatelabService(this.isEditService,data).subscribe(
          {
            next:()=>{
              this.isEditService = null;
              this.visitlabForm.reset();
              this.getDetails();
              this.toster.showSuccess("Service updated!!","your Lab Service is Updated successfully!")
            },
            error:(err:Error)=>{
              this.loader = false;
              this.toster.showError("updating Service failed!!", err.message);
            }
          }
        )
      }else{
        alert("Please Check your form and update correctly!")
      }
    }
  
    // Toggle Status (Pending <-> Complete)
    toggleStatus(res:any, status:string, service?:any) {
      this.loader = true;
      const data = {
        status:status,
        bookingDate:res.bookEvents[0].bookingDate
      }

      this.rest.patientStatus(res,'labs',data).subscribe(
        {
          next:(res:any)=>{
            this.loader = false;
            this.toster.showSuccess("Successfully Changes the patient Status","Success!")
            if(service){
              this.getPatientDetails(this.lab._id,service._id);
            }else{
              this.getAllPatientDetails(this.lab._id);
            }
          },
          error:()=>{
            this.loader = false;
            this.toster.showError("Failed to Change the patient Status","Failed!");
            if(service){
              this.getPatientDetails(this.lab._id,service._id);
            }else{
              this.getAllPatientDetails(this.lab._id);
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
      role:['LabStaff']
    });
    }

    updateStaff(){
      if(this.staffForm.valid){
      this.loader = true
      const data = {
        name:this.staffForm.value.name,
        address:this.staffForm.value.address
      };
      this.rest.updateLabStaff(this.isEditstaff._id,data).subscribe(
        {
          next:()=>{
            this.isEditstaff = null;
            this.staffForm.reset();
            this.getDetails();
            this.toster.showSuccess("Staff updated!!","your Lab Staff is Updated successfully!");
            this.isEditstaff = null;
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"updating Staff failed!!");
          }
        }
      )
      }else{
        alert("Please Check your form and update correctly!")
      }
    }

    deleteService(service:any){
      this.loader = true;
      this.rest.deleteLabService(service._id).subscribe(
        {
          next:()=>{
            this.isEditService = null;
            this.visitlabForm.reset();
            this.getDetails();
            this.toster.showSuccess("Service Deleted!","Your Lab Service is deleted successfully for your Lab!!")
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"deleting service has failed, try again after sometime!")
          }
        }
      )
    }

    editService(service:any){
      this.isEditService = service;
      this.patchValue(service);
    }

    resetServiceForm(){
      this.isEditService = null;
      this.visitlabForm.reset();
    }

    resetStaff(){
      this.staffForm.reset();
      this.isEditstaff = null;
    }

    onSubmit() {
      if (this.visitlabForm.valid) {
        const data = {
          name:this.visitlabForm.value.name,
          fee:Number(this.visitlabForm.value.fee)
        };
        this.loader = true;
        this.rest.addlabService(data).subscribe(
          {
            next:(res:any)=>{
              this.visitlabForm.reset();
              this.toster.showSuccess("New Service Added!","Success");
              this.getDetails();
            },
            error:(err:any)=>{
              this.loader = false;
              this.toster.showError(err.error.message,"Error Adding service");
            }
          }
        );
      } else {
        alert('Please fill in all required fields!');
      }
    }
    
  redirect(path:string){
    if(path == 'login'){
      this.auth.removeAuth();
    }
    this.router.navigate([path]);
  }
}
