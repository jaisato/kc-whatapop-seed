// JSON tal y como lo devuelve json-server con el db.json del proyecto (ids de producto como
// cadena, vendedor resumido), para las pruebas.

export const API = 'http://api.test';

export const productoJson = (id: number, cambios: Record<string, unknown> = {}) => ({
  id: String(id),
  name: `Producto ${id}`,
  description: `<p>Descripción del producto ${id}</p>`,
  category: { id: 1, name: 'Videojuegos' },
  seller: { id: 1, nick: 'yippeekiyay', avatar: 'images/jaxm2mrc1k4zwn5y.jpg' },
  publishedDate: 1461103200000,
  state: 'selling',
  price: 59.9,
  photos: [`images/producto-${id}.jpg`],
  ...cambios,
});

export const categoriasJson = [
  { id: 1, name: 'Videojuegos' },
  { id: 2, name: 'Películas' },
  { id: 3, name: 'Libros' },
];

export const usuarioJson = {
  id: 1,
  name: 'John McClane',
  nick: 'yippeekiyay',
  avatar: 'images/jaxm2mrc1k4zwn5y.jpg',
  latitude: 40.4211134,
  longitude: -3.70466399999998,
  email: 'ikilled@hansgruber.com',
};
