import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, retry } from 'rxjs';
import { api_url } from '../../../enviorment';
import { TosterService } from '../toster/toster.service';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http:HttpClient, private toster:TosterService) { }
  private eventSubject = new BehaviorSubject<any>(null);
  eventDetails = this.eventSubject.asObservable();
  private loader = new BehaviorSubject<any>(false);
  showLoader = this.loader.asObservable();


  userData:any;
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
          this.loader.next(false);
          this.toster.showError("Error Fetching City, Please Contact Admin!","Erro Fetching City Details!");
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
    return this.http.delete(`${api_url}organizer/delete-staff/${eventId}/${staffId}`);
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
   return this.http.post(`${api_url}patient/book-camp-doctor/${city}/${eventId}/${doctorId}`,data);
  }

  bookVisitDoctor(doctorId:any,visitDetailId:string, data:any){
   return this.http.post(`${api_url}patient/book-visit-doctor/${doctorId}/${visitDetailId}`,data);
  }

  getPatinetDetails(){
    return this.http.get(`${api_url}patient/profile`);
  }

  getlabDetails(){
    return this.http.get(`${api_url}labs/lab-details`);
  }

  updateLabSchedule(payload:any){
    return this.http.put(`${api_url}labs/update-time`,payload);
  }

  addlabService(payload:any){
    return this.http.post(`${api_url}labs/create-available-services`, payload);
  }

  updatelabService(service:any,payload:any){
    return this.http.put(`${api_url}labs/update-available-services/${service.name}`, payload);
  }

  deleteLabService(serviceId:any){
    return this.http.delete(`${api_url}labs/delete-available-services/${serviceId}`);
  }

  addLabStaff(payload:any){
    return this.http.post(`${api_url}labs/create-staff`, payload);
  }

  updateLabStaff(staffId:any, payload:any){
    return this.http.put(`${api_url}labs/edit-staff/${staffId}`, payload);
  }

  deleteLabStaff(labId:any,staffId:any){
    return this.http.delete(`${api_url}labs/delete-staff/${staffId}`);
  }

  gethospitalDetails(){
    return this.http.get(`${api_url}hospital/hospital-details`);
  }

  updatehospitalSchedule(payload:any){
    return this.http.put(`${api_url}hospital/update-time`,payload);
  }

  addhospitalService(payload:any){
    return this.http.post(`${api_url}hospital/create-available-services`, payload);
  }

  updatehospitalService(serviceId:any,payload:any){
    return this.http.post(`${api_url}hospital/update-available-services`, payload);
  }

  deleteHospitalService(serviceId:any){
    return this.http.delete(`${api_url}hospital/delete-available-services/${serviceId}`);
  }

  addHospitalStaff(payload:any,labId:any){
    return this.http.post(`${api_url}hospital/create-staff`, payload);
  }

  updateHospitalStaff(labId:any,staffId:any, payload:any){
    return this.http.put(`${api_url}hospital/create-staff/${staffId}`, payload);
  }

  deleteHospitalStaff(labId:any,staffId:any){
    return this.http.delete(`${api_url}hospital/delete-staff/${staffId}`);
  }

  addHospitalDoctor(payload:any){
    return this.http.post(`${api_url}hospital/create-doctor`, payload);
  }

  updateHospitalDoctor(doctorId:any,payload:any){
    return this.http.put(`${api_url}hospital/create-doctor/${doctorId}`, payload);
  }

  deleteHospitalDoctor(doctorId:any){
    return this.http.delete(`${api_url}hospital/delete-doctor/${doctorId}`);
  }

  bookService(mainId:any, serviceId:any,payload:any, serviceType:any){
    console.log(serviceType)
    if(serviceType == "labs"){
      return this.http.post(`${api_url}patient/book-lab/${mainId}/${serviceId}`,payload);
    }else{
      return this.http.post(`${api_url}patient/book-hospital/${mainId}/${serviceId}`,payload);
    }
  }

  getPatientList(providerId:any,serviceId:any){
   return this.http.get(`${api_url}patient/get-patients/${providerId}/${serviceId}`);
  }

  getAllPatients(providerId?:any,isFor?:string){
    const allowedRoles = ['OrganizerStaff', 'OrganizerDoctor', 'VisitDoctorStaff', 'LabStaff', 'HospitalStaff','HospitalDoctor'];
    if(allowedRoles.includes(this.userData.role)){
      return this.http.get(`${api_url+isFor}/get-all-patients`);
    }else{
      return this.http.get(`${api_url}patient/get-all-patients/${providerId}`);
    }
   }

   patientStatus(patient:any,isFor:any,payload:any){
    return this.http.put(`${api_url+isFor}/${patient.bookEvents[0].serviceId}/patient/${patient._id}`,payload);
   }
}
