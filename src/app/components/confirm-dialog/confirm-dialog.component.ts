import { Component, ElementRef, input, signal, viewChild } from '@angular/core';

/** Lo mismo que aceptaba `ConfirmationService.confirm()` de PrimeNG y usa esta aplicación. */
export interface Confirmation {
  message: string;
  accept?: () => void;
  reject?: () => void;
  /** `false` oculta el botón «No» (el aviso de compra realizada solo tiene «Sí»). */
  rejectVisible?: boolean;
}

/**
 * Diálogo modal de confirmación con el elemento nativo `<dialog>`. Sustituye a
 * `<p-confirmDialog>` de PrimeNG 1.x: `showModal()` da el fondo, la captura del foco y el
 * cierre con Escape (que cuenta como «No»).
 */
@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  readonly header = input('');

  protected readonly confirmation = signal<Confirmation | null>(null);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  confirm(confirmation: Confirmation): void {
    this.confirmation.set(confirmation);
    const dialog = this.dialog().nativeElement;
    dialog.returnValue = '';
    if (!dialog.open) {
      dialog.showModal();
    }
  }

  /** `close` llega al pulsar un botón del `<form method="dialog">` o con Escape. */
  protected onClose(): void {
    const confirmation = this.confirmation();
    const accepted = this.dialog().nativeElement.returnValue === 'accept';
    // Se limpia antes de llamar al callback, por si este abre otra confirmación.
    this.confirmation.set(null);
    if (accepted) {
      confirmation?.accept?.();
    } else {
      confirmation?.reject?.();
    }
  }
}
