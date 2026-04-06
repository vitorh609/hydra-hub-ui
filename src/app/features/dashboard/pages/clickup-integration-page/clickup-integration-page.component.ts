import { Component } from '@angular/core';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { ClickupIntegrationBoardComponent } from '../../components/clickup-integration/clickup-integration-board.component';

@Component({
  selector: 'app-clickup-integration-page',
  standalone: true,
  imports: [PageContainerComponent, ClickupIntegrationBoardComponent],
  templateUrl: './clickup-integration-page.component.html',
  styleUrl: './clickup-integration-page.component.scss',
})
export class ClickupIntegrationPageComponent {}
