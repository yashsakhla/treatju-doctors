import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, of, retry } from 'rxjs';
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


  userData:any = localStorage.getItem('userData') ? this.returnParse() : null;
  selectedCity!:string;

  eventObject:any;

  returnParse(){
    const data:any = localStorage.getItem('userData');
    return JSON.parse(data);
  }

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

  login(role:string,data:any){
    if(role == 'admin'){
      return this.http.post(`${api_url}auth/admin-login`,data);
    }else{
      return this.http.post(`${api_url}auth/login`,data);
    }
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

  deleteEvent(eventId:any){
    return this.http.delete(`${api_url}organizer/delete-event/${eventId}`);
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
    return this.http.put(`${api_url }visit-doctor/${vistId}/staff/${staffId}/update`,staff)
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
    return this.http.put(`${api_url}labs/update-available-service/${service._id}`, payload);
  }

  deleteLabService(serviceId:any){
    return this.http.delete(`${api_url}labs/delete-available-service/${serviceId}`);
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
    return this.http.put(`${api_url}hospital/update-available-service/${serviceId}`, payload);
  }

  deleteHospitalService(serviceId:any){
    return this.http.delete(`${api_url}hospital/delete-available-service/${serviceId}`);
  }

  addHospitalStaff(payload:any,labId:any){
    return this.http.post(`${api_url}hospital/create-staff`, payload);
  }

  updateHospitalStaff(labId:any,staffId:any, payload:any){
    return this.http.put(`${api_url}hospital/edit-staff/${staffId}`, payload);
  }

  deleteHospitalStaff(labId:any,staffId:any){
    return this.http.delete(`${api_url}hospital/delete-staff/${staffId}`);
  }

  addHospitalDoctor(payload:any){
    return this.http.post(`${api_url}hospital/create-doctor`, payload);
  }

  updateHospitalDoctor(doctorId:any,payload:any){
    return this.http.put(`${api_url}hospital/edit-doctor/${doctorId}`, payload);
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
    const allowedRoles = ['OrganizerStaff', 'VisitDoctorStaff', 'LabStaff', 'HospitalStaff'];
    if(allowedRoles.includes(this.userData.role)){
      return this.http.get(`${api_url+isFor}/get-all-patients`);
    }else{
      return this.http.get(`${api_url}patient/get-all-patients/${providerId}`);
    }
   }

   getAllservicePatients(serviceId:any){
    return this.http.get(`${api_url}patient/get-organizer-patients/${serviceId}`);
   }

   patientStatus(patient:any,isFor:any,payload:any){
    return this.http.put(`${api_url+isFor}/${patient.bookEvents[0].serviceId}/patient/${patient._id}`,payload);
   }

   getAdminDashboard(){
    return this.http.get(`${api_url}admin/dashboard`);
   }

   getAdminDataByCity(city:string){
    return this.http.get(`${api_url}admin/get-details/${city}`);
   }

   updatePaidStatus(id:string, payload:any, role:string){
    let apiEndpoint = '';

    switch (role) {
      case 'visitDoctors':
        apiEndpoint = `${api_url}admin/update-visit-doctor-fee/${id}`;
        break;
      case 'labs':
        apiEndpoint = `${api_url}admin/update-lab-fee/${id}`;
        break;
      case 'hospitals':
        apiEndpoint = `${api_url}admin/update-hospital-fee/${id}`;
        break;
    }

    return this.http.patch(apiEndpoint, payload);
   }

   deleteProfile(id:string, role:any){
    let apiEndpoint = '';

    switch (role) {
      case 'visitDoctors':
        apiEndpoint = `${api_url}admin/delete-visit-doctor/${id}`;
        break;
      case 'labs':
        apiEndpoint = `${api_url}admin/delete-lab/${id}`;
        break;
      case 'hospitals':
        apiEndpoint = `${api_url}admin/delete-hospital/${id}`;
        break;
    }

    return this.http.delete(apiEndpoint);
   }

   getPending(){
    const api1 = this.http.get(api_url + 'admin/get-pending-labs');
    const api2 = this.http.get(api_url + 'admin/get-pending-hospitals');
    const api3 = this.http.get(api_url + 'admin/get-pending-visit-doctors');
    
    return forkJoin([api1, api2, api3]).pipe(
      map(([lab, hospital, visitDoctor]) => ({
        lab,
        hospital,
        visitDoctor
      }))
    );
   }
}
