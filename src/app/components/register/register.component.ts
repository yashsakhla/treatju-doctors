import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CityDropdownComponent } from '../city-dropdown/city-dropdown.component';
import { HttpClient } from '@angular/common/http';
import { RestService } from '../../core/rest/rest.service';
import { LoaderComponent } from '../loader/loader.component';
import { TosterService } from '../../core/toster/toster.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,FormsModule, CityDropdownComponent, ReactiveFormsModule, LoaderComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  selectedRole: string = 'Patient';
  roles = ['Patient', 'Organizer', 'VisitDoctor', 'Lab','Hospital'];

  userName: string = '';
  age!: number;
  city: string = '';
  address: string = '';
  mobile: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  cityTouched!: boolean;
  id:string = '';
  loader!:boolean;
  selectedGender: string | null = null;


  constructor(private rest:RestService, private toster:TosterService){

  }

  selectGender(gender: string) {
    this.selectedGender = gender;
  }

  onRoleChange() {
    if (this.selectedRole === 'Patient') {
      this.city = '';
      this.address = '';
    }
    this.userName = '';
    this.mobile = '';
    this.email = ''
    this.password = '';
    this.confirmPassword = '';
    this.address = '';
    this.city = ''
    this.cityTouched = false;
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string>= {
      Patient: "bi bi-person-fill",
      Organizer: "bi bi-calendar-event",
      VisitDoctor: "bi bi-clipboard-heart",
      Lab: "bi bi-bag-plus-fill",
      Hospital: "bi bi-hospital"
    };
    return icons[role] || "bi bi-question-circle";
  }

  validateAge() {
    if (this.age !== null && this.age < 1) {
      this.age = 1;
    }
  }

  onCityBlur() {
    this.cityTouched = true; // Mark city as touched when user leaves field

  }

  isFormInvalid(): boolean {
    if (!this.userName || this.mobile.length !== 10 || this.password.length !== 6 || this.password !== this.confirmPassword) {
      return true;
    }
    if (this.selectedRole !== 'Patient' && !this.city) {
      return true;
    }
    return false;
  }
  
  register() {
    if (this.isFormInvalid()) {
      alert('Please fill all required fields correctly.');
      return;
    }
    this.loader = true
    const userData = this.selectedRole == 'Patient' ? {
      username: this.userName,
      email:this.email,
      age:this.age,
      mobile: Number(this.mobile),
      password: this.password,
      role:this.selectedRole,
      gender:this.selectedGender,
      city: this.city,
      address: this.address,
    } : {
      username: this.userName,
      email:this.email,
      city: this.city,
      address: this.address,
      mobile: Number(this.mobile),
      password: this.password,
      role:this.selectedRole,
      workId:this.id
    }
    
    this.rest.registerUser(userData).subscribe({
      next:(res:any)=>{
        this.loader = false;
        this.toster.showSuccess("You have registered Successfully, Pleae Login now!","Registeration Done")
        this.router.navigate([ 'login/user']);
      },
      error:(err:any)=>{
        this.loader = false;
        this.toster.showError(err.error.message,"Registeration Failed!");
      }
    })
  }

  handleCitySelection(city: string) {
    this.city = city;
  }

  redirect() {
    this.router.navigate(['login/user']);
  }
}
