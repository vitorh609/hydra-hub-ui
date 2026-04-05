import { Component } from '@angular/core';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginFormComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  readonly highlights = [
    'Token-driven Light and Dark themes',
    'Focused authentication layout outside the dashboard shell',
    'Ready for future API integration without UI rework',
  ] as const;
}
