import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RestService } from '../../core/rest/rest.service';
import { LoaderComponent } from '../loader/loader.component';
import { ToastrService } from 'ngx-toastr';
import { TosterService } from '../../core/toster/toster.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoginMode = true;
  selectedRole: string = 'Organizer';
  mobile!:string;
  pass!:string;
  showLoading!:boolean;
  
  constructor(private router:Router, private auth:AuthService, private rest:RestService, private toaster:TosterService){

  }

  login(){
    this.showLoading = true;
    const data = {
      mobile: Number(this.mobile),
      password:this.pass
    }

    this.rest.login(data).subscribe({
      next:(res:any)=>{
        this.showLoading = false;
        this.auth.isUserLoggedIn = true;
        this.rest.userData = res.userDetails;
        const name = res.userDetails.username ? res.userDetails.username : res.userDetails.name;
        this.toaster.showSuccess("You have successfully LoggedIn!","Hey,"+name);
        this.auth.setAuth(res.access_token);
        this.rest.userData = res.userDetails; 
        switch (res.userDetails.role) {
          case 'Patient':
            this.router.navigate(['/user']);
            break;
      
          case 'Organizer':
          case 'OrganizerDoctor':
          case 'OrganizerStaff':
            this.router.navigate(['/organizer']);
            break;
      
          case 'VisitDoctor':
          case 'VisitDoctorStaff':
            this.router.navigate(['/visit-doctor']);
            break;
      
          case 'lab':
          case 'labStaff':
            this.router.navigate(['/lab']);
            break;
      
          case 'hospital':
          case 'hospitalDoctor':
          case 'hospitalStaff':
            this.router.navigate(['/hospital']);
            break;
      
          default:
            this.router.navigate(['/login']); // Default redirection if role is unknown
            break;
        }
      },
      error:(error:any)=>{
        this.showLoading = false;
        this.toaster.showError(error.error.message, error.error.error)
      }
    })
    
  }

  redirect(){
    this.router.navigate(['/register']);
  }
}
