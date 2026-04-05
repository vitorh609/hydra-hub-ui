import { Component } from '@angular/core';

interface SocialProvider {
  readonly id: 'google' | 'facebook';
  readonly label: string;
  readonly shortLabel: string;
  readonly iconPath?: string;
}

@Component({
  selector: 'app-auth-social-buttons',
  standalone: true,
  templateUrl: './auth-social-buttons.component.html',
  styleUrl: './auth-social-buttons.component.scss',
})
export class AuthSocialButtonsComponent {
  readonly providers: readonly SocialProvider[] = [
    {
      id: 'google',
      label: 'Sign in with Google',
      shortLabel: 'G',
      iconPath: 'assets/icons/google-icon-logo.svg',
    },
    {
      id: 'facebook',
      label: 'Sign in with Facebook',
      shortLabel: 'f',
      iconPath: 'assets/icons/facebook-logo.svg',
    },
  ];

  onProviderClick(providerId: SocialProvider['id']): void {
    if (providerId === 'google') {
      console.log('Google login clicked');
      return;
    }

    console.log('Facebook login clicked');
  }
}
