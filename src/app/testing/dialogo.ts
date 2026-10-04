/**
 * jsdom no implementa los métodos de <dialog>: lo mínimo para probar la lógica de
 * ConfirmDialogComponent, con el evento close encolado como en el navegador. El foco inicial,
 * Escape y el teclado de verdad los cubren las pruebas E2E con Chromium (e2e/compra.e2e.ts).
 */
export function simularDialogo(): void {
  const proto = HTMLDialogElement.prototype;
  proto.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  proto.close ??= function (this: HTMLDialogElement, valor?: string) {
    if (valor !== undefined) {
      this.returnValue = valor;
    }
    this.open = false;
    setTimeout(() => this.dispatchEvent(new Event('close')));
  };
}

/** Deja pasar una tarea, para que llegue el evento close que encola el navegador. */
export const siguienteTarea = () => new Promise<void>((resolver) => setTimeout(resolver));
