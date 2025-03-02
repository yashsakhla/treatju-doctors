import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'treatju-doctors';
  show!:boolean;
  search: any;

  constructor(private aRouter:Router){

  }
  ngOnInit(): void {
    this.aRouter.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if(event.url === "/login" || event.url === "/register"){
        this.show = false;
      }else{
        this.show = true;
        console.log(event.url)
        this.search = event.url == '/user';
      }
    });
  }
}
