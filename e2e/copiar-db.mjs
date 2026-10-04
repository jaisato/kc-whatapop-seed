// Copia db.json a tmp/e2e/ para que la API de las pruebas E2E no modifique el original.
import { cpSync } from 'node:fs';

cpSync('db.json', 'tmp/e2e/db.json');
