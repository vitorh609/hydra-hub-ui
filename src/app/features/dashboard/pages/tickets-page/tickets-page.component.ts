import { Component } from '@angular/core';

import { PageContainerComponent } from '../../../../core/layout/page-container/page-container.component';
import { TicketBoardComponent } from '../../components/tickets/ticket-board/ticket-board.component';

@Component({
  selector: 'app-tickets-page',
  standalone: true,
  imports: [PageContainerComponent, TicketBoardComponent],
  templateUrl: './tickets-page.component.html',
  styleUrl: './tickets-page.component.scss',
})
export class TicketsPageComponent {}
