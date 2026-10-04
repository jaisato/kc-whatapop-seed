import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

/** Lo mismo que aceptaba `ConfirmationService.confirm()` de PrimeNG y usa esta aplicación. */
export interface Confirmation {
  message: string;
  accept?: () => void;
  reject?: () => void;
  /** `false` oculta el botón «No» (el aviso de compra realizada solo tiene «Sí»). */
  rejectVisible?: boolean;
}

let siguienteId = 0;

/**
 * Diálogo modal de confirmación con el elemento nativo `<dialog>`. Sustituye a
 * `<p-confirmDialog>` de PrimeNG 1.1.4 y se comporta igual: «Sí» llama a `accept`, «No» llama
 * a `reject`, y la «X» de la cabecera y Escape cierran sin llamar a ninguno de los dos.
 * `showModal()` añade el fondo, la captura del foco y el cierre con Escape.
 */
@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly header = input('');

  /** Prefijo de los id del título y del mensaje, único por instancia. */
  protected readonly id = `confirm-dialog-${siguienteId++}`;
  protected readonly confirmation = signal<Confirmation | null>(null);
  protected readonly rejectVisible = computed(() => this.confirmation()?.rejectVisible !== false);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  confirm(confirmation: Confirmation): void {
    this.confirmation.set(confirmation);
    // Se pinta antes de abrir para que showModal() enfoque el botón con autofocus de esta
    // confirmación («No», o «Sí» si no hay «No»).
    this.cdr.detectChanges();
    const dialog = this.dialog().nativeElement;
    // Una confirmación que llega con el diálogo abierto sustituye a la anterior, como en
    // PrimeNG; se reabre para que el foco inicial sea el de la nueva.
    if (dialog.open) {
      dialog.close();
    }
    dialog.showModal();
  }

  /** «Sí». */
  protected accept(): void {
    this.resolve()?.accept?.();
  }

  /** «No». */
  protected reject(): void {
    this.resolve()?.reject?.();
  }

  /** La «X»: como `hide()` de PrimeNG, cierra sin aceptar ni rechazar. */
  protected dismiss(): void {
    this.resolve();
  }

  /**
   * El navegador encola el evento `close`, así que puede llegar cuando ya se ha abierto otra
   * confirmación: si el diálogo vuelve a estar abierto, el evento es de la anterior y se ignora.
   * Si no, el diálogo se ha cerrado sin pasar por los botones (Escape): no se llama a nada.
   */
  protected onClose(): void {
    if (!this.dialog().nativeElement.open) {
      this.confirmation.set(null);
    }
  }

  /** Cierra el diálogo y devuelve la confirmación abierta en el momento del clic. */
  private resolve(): Confirmation | null {
    const confirmation = this.confirmation();
    this.confirmation.set(null);
    this.dialog().nativeElement.close();
    return confirmation;
  }
}
