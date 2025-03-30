import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  role: any;
  validRoles = ['user','admin']
  showModal: any;
  
  constructor(private router:Router, private auth:AuthService, private rest:RestService, private toaster:TosterService, private route:ActivatedRoute){
    this.route.paramMap.subscribe(params => {
      this.role = params.get('role');
      if (!this.validRoles.includes(this.role)) {
        this.router.navigate(['login/user']); // Redirect to seller login if invalid
      }
    });
  } 

  login(){
    this.showLoading = true;
    const data = this.role == 'admin' ? {
      email: this.mobile,
      password:this.pass
    } : {
      mobile: Number(this.mobile),
      password:this.pass
    }

    this.rest.login(this.role,data).subscribe({
      next:(res:any)=>{
        this.showLoading = false;
        this.auth.isUserLoggedIn = true;
        if(res.userDetails){
        this.rest.userData = res.userDetails;
        if(res.userDetails.serviceStoped || (res.userDetails.role == 'VisitDoctor' && res.userDetails.feeBalance == 0)){
          this.showModal = true;
          return;
        }
        const name = res.userDetails.username ? res.userDetails.username : res.userDetails.name;
        this.toaster.showSuccess("You have successfully LoggedIn!","Hey,"+name);
        this.auth.setAuth(res.access_token, res.userDetails);
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
      
          case 'Lab':
          case 'LabStaff':
            this.router.navigate(['/lab']);
            break;
      
          case 'Hospital':
          case 'HospitalDoctor':
          case 'HospitalStaff':
            this.router.navigate(['/hospital']);
            break;
      
          default:
            this.router.navigate(['login']); // Default redirection if role is unknown
            break;
        }
        }else if(res.admin){
          this.rest.userData = res.admin;
        this.toaster.showSuccess("You have successfully LoggedIn!","Hey, ADMIN");
        this.auth.setAuth(res.access_token, res.admin);
        this.router.navigate(['admin'])
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

  closeModal() {
    this.showModal = false;
  }
}
