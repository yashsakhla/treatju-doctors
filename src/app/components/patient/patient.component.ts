import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RestService } from '../../core/rest/rest.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.scss'
})
export class PatientComponent implements OnInit {

  eventObj:any;
  buttons:any[]=[
    {
      name:"Free Camp",
      active:true,
      notification:0,
      key:"camp"
    },
    {
      name:"Visit Doctor",
      active:false,
      notification:0,
      key:"doctors"
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
  showContent:any;
  btnName:string = this.buttons[0].name;
  modalData:any;
  today: string = '';
  activeButton = 'camp'

  private subscription!: Subscription;
  constructor(private rest:RestService){
      this.subscription = rest.eventDetails.subscribe((res:any)=>{

        this.eventObj = res;
        this.updateNotifications(res,this.buttons);
      })
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

  

  bookCamp(data: any, doctor: string) {
    if (!data.bookedDoctors) {
      data.bookedDoctors = [];
    }
    data.bookedDoctors.push(doctor);
    alert(`Booked ${doctor} for ${data.name}`);
  }
 

  ngOnInit(): void {
    const currentDate = new Date();
  this.today = currentDate.toISOString().split('T')[0];
  }

  updateNotifications(eventObject: any, buttons: any[]) {
    buttons.forEach(button => {
      const key = button.key;
      if (eventObject[key]) {
        button.notification = eventObject[key].length; // Set notification count
      }
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

  submitBooking(){
    
  }

  book(){
    this.modalInstance.hide();
  }

  bookDoctor(data:any){}
}
