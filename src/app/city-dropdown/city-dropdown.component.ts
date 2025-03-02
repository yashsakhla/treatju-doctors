import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-city-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './city-dropdown.component.html',
  styleUrl: './city-dropdown.component.scss'
})
export class CityDropdownComponent {
selectedCity = '';
cities: string[] = [
    "Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai", 
    "Hyderabad", "Ahmedabad", "Pune", "Jaipur", "Surat",
    "Lucknow", "Kanpur", "Nagpur", "Visakhapatnam", "Indore",
    "Thane", "Bhopal", "Coimbatore", "Patna", "Vadodara",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
    "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar",
    "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar",
    "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Jodhpur",
    "Mysore", "Gwalior", "Bhubaneswar", "Salem", "Warangal",
    "Mangalore", "Tiruchirappalli", "Raipur", "Jabalpur", "Kota",
    "Bikaner", "Udaipur", "Dehradun", "Siliguri", "Durgapur",
    "Kochi", "Nashik", "Rourkela", "Jamshedpur", "Kurnool",
    "Tirupati", "Kozhikode", "Gurgaon", "Noida", "Puducherry",
    "Agartala", "Imphal", "Shillong", "Aizawl", "Itanagar",
    "Gangtok", "Dimapur", "Kohima", "Dispur"
  ];
  @Output() citySelected = new EventEmitter<string>(); // Emit selected city
 searchTerm: string = '';// Store the selected city internally
 isDropdownVisible = false;
 
 filteredCities: string[] = [...this.cities]; // Initialize with all cities

 @ViewChild('dropdownInput', { static: false }) dropdownInput!: ElementRef;

 constructor(private eRef: ElementRef){

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

