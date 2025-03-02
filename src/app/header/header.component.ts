import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RestService } from '../core/rest/rest.service';
import bootstrap from 'bootstrap';
import { AuthService } from '../core/auth/auth.service';
import { Router } from '@angular/router';
import { Popover } from 'bootstrap'; // ✅ Correct
import { CitiesDirective } from '../core/directive/cities.directive';
import { CityDropdownComponent } from '../city-dropdown/city-dropdown.component';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule,CityDropdownComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, AfterViewInit {
  clicked:boolean=false;
  isDropdownVisible: boolean = false;
  selectedCity!:string
  private popoverInstance: bootstrap.Popover | null = null;

  @Input() showSearch !: boolean;

  selectedCityFromDropdown: string = ''; // Store city from dropdown
  


  constructor(private rest:RestService, public auth:AuthService, private router:Router, private elRef: ElementRef,private renderer: Renderer2) { }
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    const popoverTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.forEach(popoverTriggerEl => new Popover(popoverTriggerEl));

    document.addEventListener('click', (event: any) => {
      if (event.target && event.target.id === 'logoutBtn') {
        this.redirect('/login');
      } else if (event.target && event.target.id === 'loginBtn') {
        this.redirect('/login');
      }
    });

    const popoverTrigger = this.elRef.nativeElement.querySelector('[data-bs-toggle="popover"]');

    if (popoverTrigger) {
      this.popoverInstance = new Popover(popoverTrigger, { trigger: 'manual' });

      this.renderer.listen(popoverTrigger, 'click', (event) => {
        event.stopPropagation(); // Prevents immediate closing
        this.togglePopover();
      });

      // Listen for clicks outside to hide popover
      this.renderer.listen('document', 'click', (event) => {
        if (!this.elRef.nativeElement.contains(event.target)) {
          this.hidePopover();
        }
      });
    }
  }

  togglePopover() {
    if (this.popoverInstance) {
      const isVisible = this.elRef.nativeElement.querySelector('.popover') !== null;
      isVisible ? this.hidePopover() : this.popoverInstance.show();
    }
  }

  hidePopover() {
    if (this.popoverInstance) {
      this.popoverInstance.hide();
    }
  }

  click(){
    this.clicked = !this.clicked;
  }


  handleCitySelection(city: string) {
    this.selectedCityFromDropdown = city;
    this.rest.checkCityEvent(this.selectedCityFromDropdown)
  }


  redirect(path:string){
    this.router.navigate([path]);
  }
}

