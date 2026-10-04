import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Product } from '../../models/product';

@Component({
  selector: 'product',
  imports: [DecimalPipe],
  templateUrl: './product.component.html',
})
export class ProductComponent {
  readonly data = input<Product>();

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
  | Green Path                                                       |
  |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|
  | Expón un atributo de salida con la función output(). Su tipo     |
  | debe permitir la emisión de eventos; la idea es enviar al        |
  | componente padre el producto sobre el cuál se ha hecho clic. Y   |
  | puesto que dicho clic se realiza en el template de este          |
  | componente, necesitas, además, un manejador para el mismo.       |
  |~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  readonly onProductSelected = output<Product>();
  notifyProductSelected(data: Product): void {
    this.onProductSelected.emit(data);
  }
}
