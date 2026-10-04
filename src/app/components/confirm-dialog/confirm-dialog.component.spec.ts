import { ComponentFixture, TestBed } from '@angular/core/testing';

import { simularDialogo, siguienteTarea } from '../../testing/dialogo';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogo: HTMLDialogElement;
  const crear = async () => {
    const f = TestBed.createComponent(ConfirmDialogComponent);
    f.componentRef.setInput('header', 'Confirmación de compra');
    await f.whenStable();
    return f;
  };
  const botones = () =>
    Array.from(dialogo.querySelectorAll<HTMLButtonElement>('.botones button'), (b) =>
      b.textContent?.trim(),
    );
  const boton = (texto: string) =>
    Array.from(dialogo.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.textContent?.trim() === texto || b.getAttribute('aria-label') === texto,
    )!;

  beforeAll(simularDialogo);

  beforeEach(async () => {
    fixture = await crear();
    dialogo = fixture.nativeElement.querySelector('dialog');
  });

  it('abre un diálogo modal con el título, el mensaje y los botones Sí y No', async () => {
    expect(dialogo.open).toBe(false);

    fixture.componentInstance.confirm({ message: 'Vas a comprar Uncharted. ¿Estás seguro?' });
    await fixture.whenStable();

    expect(dialogo.open).toBe(true);
    expect(dialogo.querySelector('h2')?.textContent).toBe('Confirmación de compra');
    expect(dialogo.querySelector('p')?.textContent).toBe('Vas a comprar Uncharted. ¿Estás seguro?');
    expect(botones()).toEqual(['Sí', 'No']);
    expect(boton('Cerrar').textContent?.trim()).toBe('×');
  });

  it('se etiqueta con el título y se describe con el mensaje, con ids únicos por instancia', async () => {
    const titulo = dialogo.querySelector('h2')!;
    const mensaje = dialogo.querySelector('p')!;
    expect(dialogo.getAttribute('aria-labelledby')).toBe(titulo.id);
    expect(dialogo.getAttribute('aria-describedby')).toBe(mensaje.id);
    // Un <h2> y no un <header>, que fuera de un <article> o <section> sería un landmark banner.
    expect(dialogo.querySelector('header')).toBeNull();

    const otro: HTMLDialogElement = (await crear()).nativeElement.querySelector('dialog');
    expect(otro.querySelector('h2')!.id).not.toBe(titulo.id);
    expect(otro.querySelector('p')!.id).not.toBe(mensaje.id);
  });

  it('el foco inicial va a «No» (autofocus), y a «Sí» si no hay «No»', async () => {
    fixture.componentInstance.confirm({ message: '¿Seguro?' });
    expect(boton('No').hasAttribute('autofocus')).toBe(true);
    expect(boton('Sí').hasAttribute('autofocus')).toBe(false);

    // confirm() pinta antes de abrir, así que showModal() ya ve el autofocus de la nueva.
    fixture.componentInstance.confirm({ message: 'Producto comprado.', rejectVisible: false });
    expect(botones()).toEqual(['Sí']);
    expect(boton('Sí').hasAttribute('autofocus')).toBe(true);
  });

  it('«Sí» llama a accept y cierra el diálogo', () => {
    const accept = vi.fn();
    const reject = vi.fn();
    fixture.componentInstance.confirm({ message: '¿Seguro?', accept, reject });

    boton('Sí').click();

    expect(accept).toHaveBeenCalledOnce();
    expect(reject).not.toHaveBeenCalled();
    expect(dialogo.open).toBe(false);
  });

  it('«No» llama a reject y cierra el diálogo', () => {
    const accept = vi.fn();
    const reject = vi.fn();
    fixture.componentInstance.confirm({ message: '¿Seguro?', accept, reject });

    boton('No').click();

    expect(reject).toHaveBeenCalledOnce();
    expect(accept).not.toHaveBeenCalled();
    expect(dialogo.open).toBe(false);
  });

  it('la «X» y Escape cierran sin llamar a accept ni a reject, como hide() de PrimeNG', async () => {
    const accept = vi.fn();
    const reject = vi.fn();

    fixture.componentInstance.confirm({ message: '¿Seguro?', accept, reject });
    boton('Cerrar').click();
    expect(dialogo.open).toBe(false);

    // Escape cierra el <dialog> desde el navegador, sin pasar por los botones.
    fixture.componentInstance.confirm({ message: '¿Seguro?', accept, reject });
    dialogo.close();
    await siguienteTarea();
    await fixture.whenStable();

    expect(accept).not.toHaveBeenCalled();
    expect(reject).not.toHaveBeenCalled();
    expect(dialogo.querySelector('p')?.textContent).toBe('');
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

    boton('Sí').click();
    // Llega el close del primer cierre, con el diálogo ya abierto para la segunda.
    await siguienteTarea();
    await fixture.whenStable();

    expect(dialogo.open).toBe(true);
    expect(dialogo.querySelector('p')?.textContent).toBe('Producto comprado. ¡Enhorabuena!');
    boton('Sí').click();
    expect(segunda).toHaveBeenCalledOnce();
  });

  it('un close atrasado no borra la confirmación que se abrió después', async () => {
    // Lo que se reproducía en Chrome con `d.close('accept'); botonComprar.click()` en la misma
    // tarea: el close encolado del primer cierre llegaba con la segunda confirmación ya abierta,
    // la vaciaba y «Sí» dejaba de hacer nada.
    const primera = vi.fn();
    const segunda = vi.fn();
    fixture.componentInstance.confirm({ message: 'Primera', accept: primera });
    dialogo.close('accept');
    fixture.componentInstance.confirm({ message: 'Segunda', accept: segunda });

    await siguienteTarea();
    await fixture.whenStable();

    expect(dialogo.open).toBe(true);
    expect(dialogo.querySelector('p')?.textContent).toBe('Segunda');
    boton('Sí').click();
    expect(segunda).toHaveBeenCalledOnce();
    expect(primera).not.toHaveBeenCalled();
  });
});
