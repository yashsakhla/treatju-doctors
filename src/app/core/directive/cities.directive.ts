import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appCities]',
  standalone: true,
  
})
export class CitiesDirective {

  @Input() values: string[] = []; // List of dropdown values
  @Output() selectedValue = new EventEmitter<string>(); // Emit selected value

  isDropdownVisible = false;
  filteredValues: string[] = [];
  searchTerm: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('focus', ['$event']) onFocus(event: Event) {
    this.toggleDropdown(true);
  }

  @HostListener('input', ['$event']) onInput(event: Event) {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    this.searchTerm = inputElement.value;
    this.filterValues();
  }

  @HostListener('blur', ['$event']) onBlur(event: Event) {
    setTimeout(() => this.toggleDropdown(false), 200);
  }

  toggleDropdown(state: boolean) {
    this.isDropdownVisible = state;
    if (state) this.filterValues();
  }

  filterValues() {
    this.filteredValues = this.values.filter(value =>
      value.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectValue(value: string) {
    this.searchTerm = value;
    this.selectedValue.emit(value);
    this.toggleDropdown(false);
  }

}
