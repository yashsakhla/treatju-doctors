import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CityDropdownComponent } from '../city-dropdown/city-dropdown.component';
import { HttpClient } from '@angular/common/http';
import { RestService } from '../core/rest/rest.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,FormsModule, CityDropdownComponent, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  selectedRole: string = 'Patient';
  roles = ['Patient', 'Organizer', 'Doctor', 'Lab','Hospital'];

  userName: string = '';
  age: number | null = null;
  city: string = '';
  address: string = '';
  mobile: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  cityTouched!: boolean;

  constructor(private rest:RestService){

  }

  onRoleChange() {
    if (this.selectedRole === 'Patient') {
      this.city = '';
      this.address = '';
    } else {
      this.age = null;
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

  validateAge() {
    if (this.age !== null && this.age < 1) {
      this.age = 1;
    }
  }

  onCityBlur() {
    this.cityTouched = true; // Mark city as touched when user leaves field

  }

  isFormInvalid(): boolean {
    if (!this.userName || this.mobile.length !== 10 || this.password.length !== 4 || this.password !== this.confirmPassword) {
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
    const userData = {
      userName: this.userName,
      age: this.age,
      city: this.city,
      address: this.address,
      mobile: this.mobile,
      email: this.email,
      password: this.password,
      role:this.selectedRole,
      data:this.selectedRole == "Organizer"?{
        eventDetails:[],
        doctors:[],
        staff:[]
      }:this.selectedRole == "Doctor" ? {
        visitDetails:[],
        staff:[]
      }:this.selectedRole == "Lab"? {
        labDetails:[]
      }:this.selectedRole == "Hospital" ? {
        hospitalDetails:[]
      }:{

      }
    }
    
    this.rest.registerUser(userData).subscribe((res:any)=>{
      this.router.navigate(['login']);
    })
  }

  handleCitySelection(city: string) {
    this.city = city;
  }

  redirect() {
    this.router.navigate(['/login']);
  }
}
