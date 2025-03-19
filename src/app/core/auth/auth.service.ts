import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isUserLoggedIn:boolean = false;

  setAuth(token:string, userData:any){
    localStorage.setItem('token',token);
    localStorage.setItem('userData', JSON.stringify(userData))
  }

  getAuth(){
    const token = localStorage.getItem('token');
    return token ? true : false;
  }

  removeAuth(){
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }
}
