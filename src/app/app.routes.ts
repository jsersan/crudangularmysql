// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProductosListComponent } from './components/productos-list/productos-list.component';
import { ProductoDetalleComponent } from './components/producto-detalle/producto-detalle.component';
import { ApiTestComponent } from './components/api-test/api-test.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: 'productos', component: ProductosListComponent },
  { path: 'productos/:id', component: ProductoDetalleComponent },
  { path: 'pruebas-api', component: ApiTestComponent }, // temporal (Paso 6)
  { path: 'add', component: ProductoFormComponent },
  { path: '**', redirectTo: 'productos' }
];