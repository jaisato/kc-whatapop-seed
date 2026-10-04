import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogComponent } from './confirm-dialog.component';

type DialogoDePrueba = HTMLDialogElement & { returnValue: string };

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogo: DialogoDePrueba;
  const botones = () =>
    Array.from(dialogo.querySelectorAll('button'), (b) => [b.textContent?.trim(), b.value]);

  beforeAll(() => {
    // jsdom no implementa los métodos de <dialog> ni `form method="dialog"`: lo mínimo para
    // probar la lógica del componente. El comportamiento nativo (clic en los botones,
    // Escape) lo cubre la prueba E2E en Chromium.
    const proto = HTMLDialogElement.prototype as Partial<DialogoDePrueba>;
    proto.showModal ??= function (this: DialogoDePrueba) {
      this.open = true;
    };
    proto.close ??= function (this: DialogoDePrueba, valor?: string) {
      if (valor !== undefined) {
        this.returnValue = valor;
      }
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('header', 'Confirmación de compra');
    await fixture.whenStable();
    dialogo = fixture.nativeElement.querySelector('dialog');
  });

  it('abre un diálogo modal con la cabecera, el mensaje y los botones Sí y No', async () => {
    expect(dialogo.open).toBe(false);

    fixture.componentInstance.confirm({ message: 'Vas a comprar Uncharted. ¿Estás seguro?' });
    await fixture.whenStable();

    expect(dialogo.open).toBe(true);
    expect(dialogo.querySelector('header')?.textContent).toBe('Confirmación de compra');
    expect(dialogo.querySelector('p')?.textContent).toBe('Vas a comprar Uncharted. ¿Estás seguro?');
    // El value de cada botón es el returnValue con el que <form method="dialog"> cierra.
    expect(botones()).toEqual([
      ['Sí', 'accept'],
      ['No', 'reject'],
    ]);
  });

  it('con rejectVisible: false solo muestra el botón Sí', async () => {
    fixture.componentInstance.confirm({ message: 'Producto comprado.', rejectVisible: false });
    await fixture.whenStable();

    expect(botones()).toEqual([['Sí', 'accept']]);
  });

  it('llama a accept al cerrarse con el botón Sí', () => {
    const accept = vi.fn();
    const reject = vi.fn();
    fixture.componentInstance.confirm({ message: '¿Seguro?', accept, reject });

    dialogo.close('accept');

    expect(accept).toHaveBeenCalledOnce();
    expect(reject).not.toHaveBeenCalled();
  });

  it('llama a reject al cerrarse con No o con Escape', () => {
    const accept = vi.fn();
    const reject = vi.fn();

    fixture.componentInstance.confirm({ message: '¿Seguro?', accept, reject });
    dialogo.close('reject');
    // Escape cierra sin returnValue; confirm() lo deja vacío al abrir.
    fixture.componentInstance.confirm({ message: '¿Seguro?', accept, reject });
    dialogo.close();

    expect(reject).toHaveBeenCalledTimes(2);
    expect(accept).not.toHaveBeenCalled();
  });

  it('permite abrir otra confirmación desde accept', async () => {
    const segunda = vi.fn();
    fixture.componentInstance.confirm({
      message: 'Vas a comprar Uncharted. ¿Estás seguro?',
      accept: () =>
        fixture.componentInstance.confirm({
          message: 'Producto comprado. ¡Enhorabuena!',
          rejectVisible: false,
          accept: segunda,
        }),
    });

    dialogo.close('accept');
    await fixture.whenStable();

    expect(dialogo.open).toBe(true);
    expect(dialogo.querySelector('p')?.textContent).toBe('Producto comprado. ¡Enhorabuena!');
    dialogo.close('accept');
    expect(segunda).toHaveBeenCalledOnce();
  });
});
