import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http:HttpClient) { }
  private eventSubject = new BehaviorSubject<any>(null);
  eventDetails = this.eventSubject.asObservable();


  userData:any;

  apiUrl = 'http://localhost:3000/users'; 

  eventObject:any = {
    "camp":[
      {
        name: 'Health Camp A',
        category: 'General',
        date:'Tue, 18 Feb 2025 20:13:24 +0000',
        startTime:'Tue, 18 Feb 2025 08:13:24 +0000',
        endTime:'Tue, 18 Feb 2025 20:13:24 +0000',
        place: 'City Hospital',
        doctors: ['Dr. Smith', 'Dr. John'],
        bookedDoctors: []
      },
    ],
    "doctors":[
      {
        name: 'Dr.ABC',
        category: 'General',
        date:'Tue, 18 Feb 2025 20:13:24 +0000',
        startTime:'Tue, 18 Feb 2025 08:13:24 +0000',
        endTime:'Tue, 18 Feb 2025 20:13:24 +0000',
        place: 'City Hospital',
      },
    ],
    "labs":[
      {
        "name":"Free Camp 1",
        "place":"Belapur",
        "category":["X-ray"],
        "openTime":"10Am-7Pm",
        "booked":false
      },
    ],
    "hospitals":[
      {
        "name":"Free Camp 1",
        "place":"Seawoods",
        "category":["cardio","lungs"],
        "openTime":"10Am-7Pm",
        "booked":false
      },
    ],

  }

  checkCityEvent(city:string){
    if(city == "Mumbai"){
      this.eventSubject.next(this.eventObject);
    }else{
        this.eventSubject.next(
          {
            "camp":[

            ],
            "doctors":[

            ],
            "labs":[

            ],
            "hospitals":[
 
            ],
          }
        );
      }
  }


  registerUser(data:any){
   return this.http.post(this.apiUrl,data);
  }

  login(data:any){
    return this.http.get<any[]>(`${this.apiUrl}?mobile=${data.mobile}&password=${data.pass}`);
  }

  addEvent(eventDetails:any){
    return this.http.patch<any>(`${this.apiUrl}/${this.userData.id}`,eventDetails);
  }

  addEventDoctor(doctor:any){
    return this.http.patch(`${this.apiUrl}/${this.userData.id}`,doctor);
  }

  addEventStaff(staff:any){
    return this.http.patch(`${this.apiUrl}/${this.userData.id}`,staff);
  }

  addVisitDoctor(visitDetails:any){
    return this.http.patch(`${this.apiUrl}/${this.userData.id}`,visitDetails);
  }
}
