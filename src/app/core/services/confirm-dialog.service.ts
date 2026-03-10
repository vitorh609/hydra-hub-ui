import { Injectable, inject } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ConfirmActionModalComponent } from '../ui/confirm-action-modal/confirm-action-modal.component';

type ConfirmDialogInput = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly modalService = inject(BsModalService);

  open(input: ConfirmDialogInput): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      let isResolved = false;
      const resolveOnce = (confirmed: boolean): void => {
        if (isResolved) {
          return;
        }
        isResolved = true;
        resolve(confirmed);
      };

      const modalRef = this.modalService.show(ConfirmActionModalComponent, {
        class: 'modal-dialog-centered app-themed-modal',
        initialState: {
          title: input.title,
          message: input.message,
          confirmText: input.confirmText ?? 'Delete',
          cancelText: input.cancelText ?? 'Cancel',
          onClose: (confirmed: boolean) => resolveOnce(confirmed),
        },
      });

      const hiddenSub = this.modalService.onHidden?.subscribe(() => {
        hiddenSub?.unsubscribe();
        resolveOnce(false);
      });

      const content = modalRef.content as ConfirmActionModalComponent | undefined;
      if (!content) {
        resolveOnce(false);
      }
    });
  }
}
