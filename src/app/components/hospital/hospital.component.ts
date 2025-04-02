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
import { PdfService } from '../../core/pdf/pdf.service';

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
        name:"services",
        active:false,
        notification:0,
        key:"services"
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
      { title: 'Total Staff', value: 0 },
      { title: 'Total Services', value: 0 },
      { title: 'Total Doctors', value: 0 },
      { title: 'Total Bookings', value: 0 },
      { title: 'Pending Bookings', value: 0},
      { title: 'Completed Bookings', value:0},
      { title: 'Cancel Bookings', value: 0 },
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
  isFirstLoad: boolean = true;
  
    constructor(private rest: RestService, private fb: FormBuilder, private auth :AuthService, private router:Router, private toster:TosterService, private pdf:PdfService) {
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
        shiftOneStartTime: ['', Validators.required],
        shiftOneEndTime: ['', [Validators.required]],
        shiftTwoStartTime: [''],
        shiftTwoEndTime: [''],
      });

      this.staffForm = this.fb.group({
        name: ['', Validators.required],
        address: ['', Validators.required],
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        password: ['', Validators.required],
      });
    }
  
    ngOnInit(): void {
      this.loggedIn = this.auth.getAuth();
      this.userData = this.rest.userData;
      this.hospital = this.userData;
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
        this.getAllPatientDetails(this.showStaff._id);
      }
    }

    print(patient:any){
      this.pdf.print(this.hospital,patient);
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
      this.patients = [];
      this.loader = true;
      this.rest.getPatientList(visitId,serviceId).subscribe(
        {
          next:(res:any)=>{
            this.patients = res;
            this.loader = false;
            this.updateDashboardData(this.staff);
          },
          error:()=>{
            this.toster.showError("Error Fetching Patinets!","Please contact Admin!!")
            this.loader = false;
          }
        }
      )
    }

    getAllPatientDetails(visitId:any){
      this.patients = []
      this.loader = true;
      this.rest.getAllPatients(visitId,'hospital').subscribe(
        {
          next:(res:any)=>{
            this.patients = res;
            this.loader = false;
            if(this.userData.role == 'Hospital'){
              this.updateDashboardData(this.staff);
            }
          },
          error:(err:any)=>{
            this.toster.showError(err.error.message,"No Patients Found!!")
            this.loader = false;
            this.patients = [];
          }
        }
      )
    }


    updateDashboardData(staff:Staff[]) {
      if (this.isFirstLoad && this.hospital?._id) {
        this.getAllPatientDetails(this.hospital._id);
        this.isFirstLoad = false;
        return;
      }
      // Update dashboard data
      this.dashboardData = this.dashboardData.map((item) => {
       if (item.title === 'Total Bookings') {
          return { ...item, value: this.patients.length }; // Assuming patients represent bookings
        } else if(item.title === 'Total Services'){
          return { ...item, value: this.serviceDetails.length };
        }else if(item.title === 'Total Doctors'){
          return { ...item, value: this.doctors.length };
        }else if(item.title === 'Total Staff'){
          return { ...item, value: staff.length };
        }else if(item.title === 'Pending Bookings'){
          return { ...item, value: this.patients.filter(p => p.bookEvents[0].status === 'Pending').length };
        }
        else if(item.title === 'Completed Bookings'){
          return { ...item, value: this.patients.filter(p => p.bookEvents[0].status === 'Completed').length };
        }
        else if(item.title === 'Cancel Bookings'){
          return { ...item, value: this.patients.filter(p => p.bookEvents[0].status === 'Cancel').length };
        }else if(item.title === 'Fee Collection'){
          return { ...item, value: this.updateRevenue()}
        }else if(item.title === 'Admin Revenue (20%)'){
          return { ...item, value: '₹'+  (this.updateRevenue() * 0.2).toFixed(2)}
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
      this.visithospitalForm = this.fb.group({
        name: [events.name, Validators.required],
        fee: [events.fee, [Validators.required, Validators.min(1)]]
      });
    }

    patchhospitalvalue(hospital:any){
      this.hospitalForm = this.fb.group({
        shiftOneStartTime: [hospital.shiftOneStartTime, Validators.required],
        shiftOneEndTime: [hospital.shiftOneEndTime, [Validators.required]],
        shiftTwoStartTime: [hospital.shiftTwoStartTime],
        shiftTwoEndTime: [hospital.shiftTwoEndTime],
      });
    }
  
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  
    showContent(path: string, data?:any) {
      this.show = path;
      if(data.role == "HospitalDoctor"){
        this.showDoctor = data;
        this.getPatientDetails(this.hospital._id,data.serviceId);
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

    findId(name:string){
      return this.serviceDetails.find(item => item.name === name)?._id;
    }

    addDoctor() {
      console.log(this.doctorForm.value)
      if (this.doctorForm.valid) {
        this.loader = true;
        const data = this.doctorForm.value;
        data.mobile = Number(data.mobile);
        data.serviceId = this.findId(data.service);
        data.role = "HospitalDoctor"
        this.rest.addHospitalDoctor(data).subscribe( {
          next:(res:any)=>{
            if(res){
              this.doctorForm.reset();
              this.getDetails();
              this.toster.showSuccess("Doctor Added to Hospital Successfully!","Doctor Added!!")
            }
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"Failed to Add Doctor!")
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
          service:this.doctorForm.value.service,
          serviceId:this.findId(this.doctorForm.value.service)
        };
        this.rest.updateHospitalDoctor(this.isEditDoctor._id,data ).subscribe( {
          next:(res:any)=>{
            if(res){
              this.isEditDoctor = null;
              this.doctorForm.reset();
              this.getDetails();
              this.toster.showSuccess("Doctor Changes Are edited Successfully!","Edited Successfully!");
            }
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"Error Editing Doctor!")
          }
        })
      }else{
        alert("Please check the form values, and fill all the valid values!")
      }
    }

    deleteDoctor(doctor:any) {
      this.loader = true;
      this.rest.deleteHospitalDoctor(doctor._id).subscribe({
        next:(res:any)=>{
          this.isEditDoctor = null;
          this.doctorForm.reset();
          this.getDetails();
          this.toster.showSuccess("Doctor is deleted Successfully!","Deleted Successfully!");
        },
        error:(err:any)=>{
          this.loader = false;
          this.toster.showError(err.error.message,"Error Deleting Doctor!")
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
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"Adding Staff has failed!")
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
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"deleting Staff has failed!")
          }
        }
      )
    }

    updatehospitalService(){
      if(this.visithospitalForm.valid){
        const data = this.visithospitalForm.value;
      this.loader = true;
      this.rest.updatehospitalService(this.isEditService._id,data).subscribe(
        {
          next:()=>{
            this.isEditService = null;
            this.visithospitalForm.reset();
            this.getDetails();
            this.toster.showSuccess("Service updated!!","your hospital Service is Updated successfully!")
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"updating Service failed!!");
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
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"Failed to Update the Status!");
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
      const data = {
        mobile:this.staffForm.value.mobile,
        address:this.staffForm.value.address
      };
      this.rest.updateHospitalStaff(this.hospital._id, this.isEditstaff._id,data).subscribe(
        {
          next:()=>{
            this.isEditstaff = null;
            this.staffForm.reset();
            this.getDetails();
            this.toster.showSuccess("Staff updated!!","your hospital Staff is Updated successfully!")
          },
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"updating Staff failed!!");
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
          error:(err:any)=>{
            this.loader = false;
            this.toster.showError(err.error.message,"Error deletinig service!!")
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
    if(path ==  'login/user'){
      this.auth.removeAuth();
    }
    this.router.navigate([path]);
  }

  redirectToPhonePe() {
    const upiUrl = `phonepe://pay?pa=Q787720513@ybl&pn=${this.userData.name}&mc=0000&tn=Payment for service&am=${this.userData.feeBalance}&cu=INR`;
    window.location.href = upiUrl;
  }
}
