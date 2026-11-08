// src/app/components/productos-list/productos-list.component.ts  ·  Versión final
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // para [(ngModel)] del buscador
import { RouterLink } from '@angular/router'; // enlace al detalle
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';
import { ProductoFormComponent } from '../producto-form/producto-form.component';

@Component({
  selector: 'app-productos-list',
  imports: [
    CurrencyPipe,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-lis.component.css'
})
export class ProductosListComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  // Columnas que se mostrarán en la tabla, en este orden
  readonly displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'precio', 'stock', 'acciones'];

  // Los productos llegan del servidor: se guardan en un signal
  readonly productos = signal<Producto[]>([]);

  // Término de búsqueda (lo actualiza el propio input con [(ngModel)])
  nombreBusqueda = '';

  // Paginación: página actual (empieza en 0) y tamaño de página
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);

  // Página visible = trozo del array; se recalcula sola cuando cambia cualquiera de los tres signals
  readonly paginaActual = computed(() => {
    const inicio = this.pageIndex() * this.pageSize();
    return this.productos().slice(inicio, inicio + this.pageSize());
  });

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.productoService.getAll().subscribe({
      next: data => {
        console.log('[lista] productos recibidos:', data.length);
        this.cargar(data);
      },
      error: e => console.error('[lista] error al cargar', e)
    });
  }

  /** Busca por nombre; si el campo está vacío, recarga todo */
  buscarPorNombre(): void {
    const texto = this.nombreBusqueda.trim();
    console.log('[lista] buscar:', texto === '' ? '(todo)' : texto);
    this.pageIndex.set(0); // volver a la página 1 tras filtrar

    if (texto) {
      this.productoService.findByNombre(texto).subscribe({
        next: data => this.cargar(data),
        error: e => console.error('[lista] error al buscar', e)
      });
    } else {
      this.obtenerProductos();
    }
  }

  /** Abre el formulario en un diálogo (crear si no hay producto, editar si lo hay) */
  abrirFormulario(producto?: Producto): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '500px',
      data: producto || {} // el formulario lo recibe con MAT_DIALOG_DATA
    });

    // afterClosed() emite el valor con el que se cerró el diálogo (undefined si se canceló)
    dialogRef.afterClosed().subscribe(result => {
      console.log('[lista] diálogo cerrado con:', result);
      if (result) {
        this.obtenerProductos();
      }
    });
  }

  /** Elimina un producto tras confirmarlo */
  eliminarProducto(id: number): void {
    if (!confirm('¿Está seguro de eliminar este producto?')) {
      console.log('[lista] borrado cancelado, id', id);
      return;
    }
    this.productoService.delete(id).subscribe({
      next: () => {
        console.log('[lista] borrado el id', id);
        this.snackBar.open('Producto eliminado correctamente', 'Cerrar', { duration: 3000 });
        this.obtenerProductos();
      },
      error: e => console.error('[lista] error al borrar', e)
    });
  }

  /** Evento (page) del paginador: guarda página y tamaño */
  cambiarPagina(evento: PageEvent): void {
    console.log('[lista] página', evento.pageIndex, 'tamaño', evento.pageSize);
    this.pageIndex.set(evento.pageIndex);
    this.pageSize.set(evento.pageSize);
  }

  /** Guarda los datos y corrige la página si se ha quedado vacía (p. ej. tras borrar) */
  private cargar(data: Producto[]): void {
    this.productos.set(data);
    const ultimaPagina = Math.max(0, Math.ceil(data.length / this.pageSize()) - 1);
    if (this.pageIndex() > ultimaPagina) {
      this.pageIndex.set(ultimaPagina);
    }
  }
}
