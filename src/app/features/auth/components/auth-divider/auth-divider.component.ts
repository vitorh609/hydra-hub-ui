import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-divider',
  standalone: true,
  templateUrl: './auth-divider.component.html',
  styleUrl: './auth-divider.component.scss',
})
export class AuthDividerComponent {
  @Input({ required: true }) text!: string;
}
