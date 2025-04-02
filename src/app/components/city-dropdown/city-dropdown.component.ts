import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { city } from '../../city';

@Component({
  selector: 'app-city-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './city-dropdown.component.html',
  styleUrl: './city-dropdown.component.scss'
})
export class CityDropdownComponent {
selectedCity = '';
cities: string[] = city;
  @Output() citySelected = new EventEmitter<string>(); // Emit selected city
 searchTerm: string = '';// Store the selected city internally
 isDropdownVisible = false;
 
 filteredCities: string[] = [...this.cities]; // Initialize with all cities

 @ViewChild('dropdownInput', { static: false }) dropdownInput!: ElementRef;

 constructor(private eRef: ElementRef){

 }


openDropdown() {
  this.isDropdownVisible = true;
  setTimeout(() => document.getElementById('searchBox')?.focus(), 0);
}


 toggleDropdown() {
   this.isDropdownVisible = true;
 }

 filterCities() {
   this.filteredCities = this.cities.filter(city =>
     city.toLowerCase().includes(this.searchTerm.toLowerCase())
   );
 }

 selectCity(city: string) {
  console.log(city)
   this.selectedCity = city; // Store selected city in component
   this.searchTerm = city; // Show selected city in input field
   this.citySelected.emit(city); // Emit selected city to parent
   setTimeout(() => (this.isDropdownVisible = false), 100); // Hide dropdown
 }

 @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownVisible = false;
    }
  }
}

