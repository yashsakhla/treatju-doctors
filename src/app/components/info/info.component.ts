import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  contentType: string = '';
  email:string = 'tritju@gmail.com';

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.contentType = params.get('type') || '';
    });
  }
}
