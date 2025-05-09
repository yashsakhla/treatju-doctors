import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { retry } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RestService } from '../../core/rest/rest.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  constructor(private auth:AuthService, private router:Router, private rest:RestService){}
  isUserLoggedIn!:boolean;
  email:string = 'tritju@gmail.com'
  ngOnInit(): void {
    this.isUserLoggedIn = this.auth.getAuth()
  }

  redirect(path:string){
    if(this.isUserLoggedIn){
      this.auth.removeAuth();
      return;
    }
    this.router.navigate([path]);
  }

  adminTo(){
    if(this.rest.userData?.role === 'Admin'){
      this.router.navigate(['admin']);
    }else{
      this.router.navigate(['login/admin'])
    }
  }
}
