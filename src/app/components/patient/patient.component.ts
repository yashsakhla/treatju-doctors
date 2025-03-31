import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RestService } from '../../core/rest/rest.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';
import { TosterService } from '../../core/toster/toster.service';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';


interface UserData {
  _id: string;
  mobile: number;
  username: string;
  age: number;
  gender: string; // Restrict gender to specific values
  email: string;
  role:string; // Add possible roles if known
  status:string; // Define expected statuses
  __v: number;
  bookEvents: []; // Array of event IDs
}

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.scss'
})


export class PatientComponent implements OnInit, OnDestroy {

  eventObj:any;
  buttons:any[]=[
    {
      name:"Free Camp",
      active:true,
      notification:0,
      key:"freeCampEvents"
    },
    {
      name:"Visit Doctor",
      active:false,
      notification:0,
      key:"visitDoctors"
    },
    {
      name:"Labs",
      active:false,
      notification:0,
      key:"labs"
    },
    {
      name:"Hospitals",
      active:false,
      notification:0,
      key:"hospitals"
    }
  ]
  showContent!:any[];
  btnName:string = this.buttons[0].name;
  modalData:any;
  today: string = '';
  activeButton = 'freeCampEvents';
  userData!:UserData;
  city!:string;
  loader!:boolean;
  isUserLoggedin:boolean = false;
  selectedDate!:string;
  selectedService:any;

  private subscription!: Subscription;
  constructor(private rest:RestService, private toster:TosterService, private auth:AuthService, private router:Router){
      this.subscription = rest.showLoader.subscribe((res:boolean)=>{
        this.loader = res;
      })
      this.subscription = rest.eventDetails.subscribe((res:any)=>{
        this.eventObj = this.filterEvents(res);
        this.city = rest.selectedCity;
        this.updateNotifications(this.eventObj,this.buttons);
        this.loader = false;
      })
  }

  filterEvents(res: any) {
    return {
      freeCampEvents: res.freeCampEvents, // No filtering needed
      visitDoctors: res.visitDoctors.filter((doctor: any) => doctor.visitDetails.length > 0),
      labs: res.labs.filter((lab: any) => lab.availableServices.length > 0),
      hospitals: res.hospitals.filter((hospital: any) => hospital.availableServices.length > 0),
    };
  }

  getIsoString(date:Date){
    return date.getTime();
  }

  @ViewChild('myModal') modalElement!: ElementRef;
  modalInstance: any;

  ngAfterViewInit() {
    this.modalInstance = new Modal(this.modalElement.nativeElement);
  }

  openModal(data:any) {
    this.modalInstance.show();
    this.modalData = data; // Opens modal
  }

  getCityDetails(){
    this.rest.checkCityEvent(this.city);
  }
  

  bookCamp(data: any, doctor: any) {
    const payload = {
      bookingDate: data.eventDate,
      status:"Booked"
    }
    this.loader = true;
    this.rest.bookFreeCamp(this.city,data._id,doctor._id, payload).subscribe(
      {
        next:(res:any)=>{
          this.getCityDetails();
          this.getUserDetails();
          this.toster.showSuccess("Event Booked!!","You Have successfully Book an Organzer Free Camp Event.");
        },
        error:(err:Error)=>{
          this.loader = false;
          this.toster.showError("Booking Failed!",err.message);
        }
      }
    )
  }
 

  ngOnInit(): void {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
    this.isUserLoggedin = this.auth.getAuth();
    this.userData = this.rest.userData;
    if(this.isUserLoggedin && this.userData.role == 'Patient'){
      this.getUserDetails();
    }
  }

  getUserDetails(){
    this.rest.getPatinetDetails().subscribe(
      {
        next:(res:any)=>{
          this.userData = res;
        },
        error:()=>{
          this.toster.showError("Error Fetching User Details!!","Error!")
        } 
      }
    )
  }

  updateNotifications(eventObject: any, buttons: any[]) {
    buttons.forEach(button => {
      const key = button.key;
      let notificationCount = 0;

  // If key is 'visitDoctors', check visitDetails inside objects
  if (key === 'visitDoctors') {
    notificationCount = eventObject[key]
      .filter((item: { visitDetails: string | any[]; }) => Array.isArray(item?.visitDetails) && item.visitDetails.length > 0)
      .reduce((count: any, item: { visitDetails: string | any[]; }) => count + item.visitDetails.length, 0);
  } else {
    // Default behavior for other keys: Count the number of items in the main array
    notificationCount = eventObject[key].length;
  }

  // Assign the calculated notification count
  button.notification = notificationCount;
    if(button.active){
        this.showContent = eventObject[key];
        this.btnName = button.name;
      }
      console.log(this.showContent);
    });
  }

  toggleActiveButton(selectedKey: string) {
    this.activeButton = selectedKey;
    this.buttons.forEach(button => {
      button.active = button.key === selectedKey;
      if(button.active){
        this.btnName = button.name;
      }
    });
    this.showContent = this.eventObj[selectedKey];
  }

  book(data:any){
    this.modalInstance.hide();
    this.loader = true;
    const payload = {
      bookingDate:new Date(this.selectedDate),
      status:"Booked"
    }
    this.rest.bookService(data._id,this.selectedService._id,payload,this.activeButton).subscribe(
      {
        next:(res:any)=>{
          if(res){
            this.getCityDetails();
            this.getUserDetails();
            this.toster.showSuccess("Service Booked!!","You Have successfully Book Hospital.");
          }
        },
        error:(err:Error)=>{
          this.loader = false;
          this.toster.showError("Booking Failed!",err.message);
        }
      }
    );
  }

  bookVisit(data:any, visit:any){
    this.loader = true;
    const payload = {
      bookingDate: visit.eventDate,
      status:"Booked"
    }
    this.rest.bookVisitDoctor(data._id,visit._id,payload).subscribe(
      {
        next:(res:any)=>{
          if(res){
            this.getCityDetails();
            this.getUserDetails();
            this.toster.showSuccess("Event Booked!!","You Have successfully Book Doctor Visit.");
          }
        },
        error:(err:Error)=>{
          this.loader = false;
          this.toster.showError("Booking Failed!",err.message);
        }
      }
    )
  }

  isBtnDisabled(data:any){
    return this.userData ? this.userData.bookEvents.find((item:any) => item.providerId == data._id) : false ;
  }

  booking(data:any){
    const event:any = this.userData.bookEvents.filter((item:any) => item.providerId == data._id);
    return event[0];
  }

  redirect(path:string){
    this.router.navigate([path]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
