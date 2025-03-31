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
import { TosterService } from '../../core/toster/toster.service';

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
  loader: boolean = false;
  showDoctorForm = false;
  showStaffForm = false;
  existData: any;
  loggedIn: boolean = false;

  buttons: any[] = [
    { name: "Organizer Camp", active: true, notification: 0, key: "organizers" },
    { name: "Visit Doctor", active: false, notification: 0, key: "visitDoctors" },
    { name: "Labs", active: false, notification: 0, key: "labs" },
    { name: "Hospital", active: false, notification: 0, key: "hospitals" },
  ];

  
  buttonsPending: any[] = [
    { name: "Visit Doctor", active: false, notification: 0, key: "visitDoctors" },
    { name: "Labs", active: true, notification: 0, key: "labs" },
    { name: "Hospital", active: false, notification: 0, key: "hospitals" },
  ];

  activeButton: string = 'organizers';
  dashboardData: any = {};
  userData: any;
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 5;
  totalItems = 20;
  organizers: any[] = [];
  lab: any;
  hospital: any;
  visitDoctor:any;
  activePendingButton:string = 'labs';

  constructor(private router: Router, private auth: AuthService, private rest: RestService, private toster: TosterService) { }

  ngOnInit(): void {
    this.loggedIn = this.auth.getAuth();
    this.userData = this.rest.userData;
    this.getData();
    this.getPending();
  }

  get filteredOrganizers() {
    return this.organizers
    .filter(org => org.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
    .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }

  get filteredPending() {
    if(this.activePendingButton == 'labs'){
      return this.lab
    .filter((org:any) => org.username.toLowerCase().includes(this.searchQuery.toLowerCase()))
    .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
    }else if(this.activePendingButton == 'hospitals'){
      return this.hospital
    .filter((org:any) => org.username.toLowerCase().includes(this.searchQuery.toLowerCase()))
    .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
    }else{
      return this.visitDoctor
      .filter((org:any) => org.username.toLowerCase().includes(this.searchQuery.toLowerCase()))
      .slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
    }
  }
  

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: Math.ceil(this.organizers.length / this.pageSize) }, (_, i) => i + 1);
  }

  deleteOrganizer(id:any) {
    this.loader = true;
    this.rest.deleteProfile(id,this.activeButton).subscribe(
      {
        next:()=>{
          this.loader = false;
          this.getData();
          this.toster.showSuccess('Deleted successfully!');
        },
        error:()=>[
          this.toster.showError('Failed to mark payment as completed.')
        ]
      }
    )
  }

  markAsPaid(id: any) {
    const payload = {
      feeBalance: 0,
      paidStatus: 'completed',
      serviceStop: false
    };

    const role = this.show == 'pending' ? this.activePendingButton : this.activeButton;
    

    this.loader = true;
    this.rest.updatePaidStatus(id, payload, role).subscribe({
      next: () => {
        this.loader = false;
        this.toster.showSuccess('Payment marked as completed successfully!');
        this.refresh();
      },
      error: (error) => {
        this.loader = false;
        this.toster.showError('Failed to mark payment as completed.');
        console.error(error);
      }
    });
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getPending(){
    this.rest.getPending().subscribe(
      {
        next:(res:any)=>{
          this.lab = res.lab;
          this.hospital = res.hospital,
          this.visitDoctor = res.visitDoctor
        }
      }
    )
  }

  getData() {
    this.loader = true;
    this.rest.getAdminDashboard().subscribe({
      next: (res: any) => {
        this.dashboardData = res;
        this.loader = false;
        this.toster.showSuccess('Dashboard data fetched successfully!');
      },
      error: (error) => {
        this.loader = false;
        this.toster.showError('Failed to fetch dashboard data.');
        console.error(error);
      }
    });
  }

  handleCitySelection(event: any) {
    this.loader = true;
    this.rest.getAdminDataByCity(event).subscribe({
      next: (res: any) => {
        this.existData = res;
        this.organizers = this.existData[this.activeButton];
        this.loader = false;
        this.toster.showSuccess('City data fetched successfully!');
      },
      error: (error) => {
        this.loader = false;
        this.toster.showError('Failed to fetch city data.');
        console.error(error);
      }
    });
  }

  toggle(btn:string){
    if(btn == 'labs'){
      this.activePendingButton = btn
    }else{
      this.activePendingButton = btn
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  showContent(path: string) {
    this.show = path;
    if(path == 'pending'){
      this.toggle('labs');
    }
  }

  redirectToHome() {
    this.router.navigate(['user']);
  }

  redirect(path: string) {
    this.router.navigate([path]);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  toggleActiveButton(selectedKey: string) {
    this.searchQuery = '';
    this.activeButton = selectedKey;
    this.organizers = this.existData[selectedKey];
    this.buttons.forEach(button => button.active = button.key === selectedKey);
  }

  refresh() {
    this.getData();
  }

  logout(){
    this.auth.removeAuth();
    this.router.navigate(['user'])
  }
}
