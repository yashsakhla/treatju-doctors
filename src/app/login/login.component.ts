import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { RestService } from '../core/rest/rest.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoginMode = true;
  selectedRole: string = 'Organizer';
  mobile!:string;
  pass!:string;
  
  constructor(private router:Router, private auth:AuthService, private rest:RestService){

  }

  login(){
    const data = {
      mobile: this.mobile,
      pass:this.pass
    }

    this.rest.login(data).subscribe((res:any)=>{
      console.log(res)
      this.rest.userData = res[0];
      if(res[0].role == "Patient"){
        this.router.navigate(['/user']);
      }else if(res[0].role == "Organizer"){
        this.router.navigate(['/organizer']);
      }else if(res[0].role == "Doctor"){
        this.router.navigate(['/visit-doctor']);
      }else if(res[0].role == "Lab"){
        this.router.navigate(['/lab']);
      }
    })
    
  }

  redirect(){
    this.router.navigate(['/register']);
  }
}
