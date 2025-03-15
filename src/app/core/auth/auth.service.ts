import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isUserLoggedIn:boolean = false;

  setAuth(token:string){
    localStorage.setItem('token',token);
  }

  getAuth(){
    const token = localStorage.getItem('token');
    return token;
  }

  removeAuth(){
    localStorage.removeItem('token');
  }
}
