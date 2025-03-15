import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { api_url } from '../../../enviorment';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http:HttpClient) { }
  private eventSubject = new BehaviorSubject<any>(null);
  eventDetails = this.eventSubject.asObservable();
  private loader = new BehaviorSubject<any>(false);
  showLoader = this.loader.asObservable();


  userData:any;
  userRole!:string;
  selectedCity!:string;

  apiUrl = 'http://localhost:3000/users'; 

  eventObject:any;

  checkCityEvent(city:string){
    this.loader.next(true);
    this.http.get(`${api_url}patient/available-doctors-services/${city}`).subscribe(
      {
        next:(res:any)=>{
          this.selectedCity = city;
         this.eventSubject.next(res);
        },
        error:()=>{

        }
      }
    );
  }


  registerUser(data:any){
   return this.http.post(api_url+'auth/signup',data);
  }

  login(data:any){
    return this.http.post(`${api_url}auth/login`,data);
  }

  addEvent(eventDetails:any){
    return this.http.post(`${api_url}organizer/create-event`,eventDetails);
  }

  updateEvent(eventDetails:any, eventId:any){
    return this.http.put(`${api_url}organizer/edit-event/${eventId}`,eventDetails);
  }

  addEventDoctor(doctor:any, eventID:string){
    return this.http.post(`${api_url}organizer/create-doctor/${eventID}`,doctor);
  }

  editEventDoctor(doctor:any,eventId:any, doctorId:any){
    return this.http.put(`${api_url}organizer/edit-doctor/${eventId}/${doctorId}`,doctor);
  }

  addEventStaff(staff:any,eventID:string){
    return this.http.post(`${api_url}organizer/create-staff/${eventID}`,staff);
  }

  editEventStaff(staff:any,eventId:any, staffId:any){
    return this.http.put(`${api_url}organizer/edit-staff/${eventId}/${staffId}`,staff);
  }

  deleteDoctor(doctorId:any, eventId:any){
    return this.http.delete(`${api_url}organizer/delete-doctor/${eventId}/${doctorId}`);
  }

  deleteStaff(staffId:any, eventId:any){
    return this.http.delete(`${api_url}organizer/delete-doctor/${eventId}/${staffId}`);
  }
  

  addVisitDoctor(visitDetails:any){
    return this.http.post(`${api_url}visit-doctor/create-visit-detail`,visitDetails);
  }

  addVisitDocStaff(staff:any,visitDetails:any){
    return this.http.post(`${api_url}visit-doctor/create-staff/${visitDetails._id}`,staff);
  }

  geUsertDetails(){
    return this.http.get(`${api_url}organizer/events`);
  }

  getVisitDoctorDetails(){
    return this.http.get(`${api_url}visit-doctor/visit-details`);
  }

  updateVisitDoctor(vistId:any, visitDoc:any){
    return this.http.put(`${api_url}visit-doctor/${vistId}/update`,visitDoc)
  }

  updateVisitDocStaff(vistId:any,staffId:any, staff:any){
    return this.http.put(`${api_url }visit-doctor/${vistId}/staff/${staffId}`,staff)
  }

  deleteVisitDoc(vistId:any){
    return this.http.delete(`${api_url }visit-doctor/${vistId}/delete`)
  }

  deleteVisitStaff(vistId:any,staffId:any){
    return this.http.delete(`${api_url }visit-doctor/${vistId}/staff/${staffId}/delete`)
  }

  bookFreeCamp(city:string,eventId:any,doctorId:any, data:any){
   return this.http.post(`${api_url}organizer/${city}/${eventId}/${doctorId}/book`,data);
  }

  bookVisitDoctor(doctorId:any,visitDetailId:string, data:any){
   return this.http.post(`${api_url}visit-doctor/${doctorId}/${visitDetailId}/book`,data);
  }

  getPatinetDetails(){
    return this.http.get(`${api_url}patient/profile`);
  }
}
