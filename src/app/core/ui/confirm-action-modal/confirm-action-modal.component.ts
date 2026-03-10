import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-action-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-action-modal.component.html',
  styleUrl: './confirm-action-modal.component.scss',
})
export class ConfirmActionModalComponent {
  title = 'Confirm action';
  message = 'Are you sure you want to continue?';
  confirmText = 'Confirm';
  cancelText = 'Cancel';
  onClose: (confirmed: boolean) => void = () => {};

  constructor(public readonly bsModalRef: BsModalRef) {}

  confirm(): void {
    this.onClose(true);
    this.bsModalRef.hide();
  }

  cancel(): void {
    this.onClose(false);
    this.bsModalRef.hide();
  }
}
