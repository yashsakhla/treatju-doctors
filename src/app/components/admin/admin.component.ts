import { Component, OnInit } from '@angular/core';
import { Offcanvas } from 'bootstrap';
import { Subscription } from 'rxjs';
import { RestService } from '../../core/rest/rest.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EventFormComponentComponent } from '../event-form-component/event-form-component.component';
import { Router } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { AuthService } from '../../core/auth/auth.service';
import { CityDropdownComponent } from '../city-dropdown/city-dropdown.component';

interface Event {
  eventName: string;
  eventPlace: string;
  eventDate: string;
  startTime: string;
  endTime: string;
}

interface Doctor {
  name: string;
  address: string;
  mobile: string;
  pass: string;
}

interface Staff {
  name: string;
  address: string;
  mobile: string;
  pass: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventFormComponentComponent, LoaderComponent, CityDropdownComponent, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  isSidebarOpen = true;
  selectedCity: any;
  show: string = 'dashboard';
  loader:boolean = false;
  showDoctorForm = false;
  showStaffForm = false;
  existData:any;
  loggedIn:boolean = false;

  buttons:any[]=[
    {
      name:"Organizer Camp",
      active:true,
      notification:0,
      key:"organizers"
    },
    {
      name:"Visit Doctor",
      active:false,
      notification:0,
      key:"visitDoctors"
    },
    {
      name:"Labs",
      active:false,
      notification:0,
      key:"labs"
    },
    {
      name:"Hospital",
      active:false,
      notification:0,
      key:"hospitals"
    },
  ];

  activeButton: string='organizers';

  dashboardData = [
    { title: 'Total Organizer Event', value: 1 },
    { title: 'Total Visit Doctor', value: 0 },
    { title: 'Total Labs', value: 0 },
    { title: 'Total Hospital', value: 0 },
    { title: 'Your Revenue', value: 0 },
    { title: 'Balance Revenue', value: 0 },
  ];
  userData: any;

  
  constructor(private router:Router, private auth:AuthService, private rest:RestService){

  }
  ngOnInit(): void {
    this.loggedIn = this.auth.getAuth();
    this.userData = this.rest.userData;
    this.getData();
  }

  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 5;
  totalItems = 20;

  organizers:any[] = [];

  get filteredOrganizers() {
    return this.organizers
      .filter(org => org.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
      .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  get pageNumbers(): number[] {
    return Array.from({ length: Math.ceil(this.organizers.length / this.pageSize) }, (_, i) => i + 1);
  }
  deleteOrganizer(index: number) {
    const globalIndex = (this.currentPage - 1) * this.pageSize + index;
    this.organizers.splice(globalIndex, 1);
  }

  markAsPaid(index: number) {
    const globalIndex = (this.currentPage - 1) * this.pageSize + index;
    this.organizers[globalIndex].pendingRevenue = 0;
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getData(){
    this.rest.getAdminDashboard().subscribe(
      {
        next:(res:any)=>{
          this.dashboardData = this.dashboardData.map((item) => {
            if (item.title === 'Total Organizer Event') {
               return { ...item, value: res.totalEvents }; // Assuming patients represent bookings
             } else if(item.title === 'Total Visit Doctor'){
               return { ...item, value: res.totalVisitDoctors };
             }else if(item.title === 'Total Labs'){
               return { ...item, value: res.totalLabs};
             }else if(item.title === 'Total Hospital'){
               return { ...item, value: res.totalHospitals };
             }
             else if(item.title === 'Your Revenue'){
               return { ...item, value: res.totalRevenue };
             }
             else if(item.title === 'Balance Revenue'){
               return { ...item, value: res.totalPendingRevenue };
             }
             return item;
           });
        },
        error:()=>{

        }
      }
    )
  }

  handleCitySelection(event:any){
    this.rest.getAdminDataByCity(event).subscribe(
      {
        next:(res:any)=>{
          this.existData = res;
          this.organizers = this.existData[this.activeButton];
        },
        error:()=>{

        }
      }
    )
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showContent(path: string) {
    this.show = path;
  }

  redirectToHome(){
    this.router.navigate(['user']);
  }

  redirect(path:string){
    this.router.navigate([path]);
  }

  toggleActiveButton(selectedKey: string) {
    this.searchQuery = '';
    this.activeButton = selectedKey;
    this.organizers = this.existData[selectedKey];
    this.buttons.forEach(button => {
      button.active = button.key === selectedKey;
    });
  }

  refresh(){

  }
}
