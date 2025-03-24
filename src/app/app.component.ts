import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'treatju-doctors';
  showHeader!:boolean;
  showFooter!:boolean;
  search: any;

  constructor(private aRouter:Router){

  }
  ngOnInit(): void {
    this.aRouter.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if(event.url === "/user" || event.url == '/' || event.url == '/info/aboutUs' || event.url == '/info/tnc' || event.url == '/info/privacy'){
        this.showHeader = true;
        this.showFooter = true;
      }else{
        this.showHeader = false;
        this.showFooter = false;
      }
    });
  }
}
