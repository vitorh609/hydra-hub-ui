import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../../../core/ui/icon/icon.component';

type StarState = 'full' | 'half' | 'empty';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './rating-stars.component.html',
  styleUrl: './rating-stars.component.scss',
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() size = 16;

  get stars(): StarState[] {
    const stars: StarState[] = [];
    for (let i = 1; i <= 5; i += 1) {
      if (this.rating >= i) {
        stars.push('full');
      } else if (this.rating >= i - 0.5) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }
}
