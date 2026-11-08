// src/app/components/producto-detalle/producto-detalle.component.ts  ·  Versión final (iteración 3)
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';

/**
 * Muestra y modifica los detalles de un producto en una página propia (no en diálogo).
 */
@Component({
  selector: 'app-producto-detalle',
  imports: [FormsModule, RouterLink, MatButtonModule],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css'
})
export class ProductoDetalleComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Producto actual (null mientras carga) y mensaje de error, en signals
  readonly currentProducto = signal<Producto | null>(null);
  readonly message = signal('');

  /** Lee el :id de la URL y carga el producto */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('[detalle] id de la URL:', id);

    // /productos/abc daría NaN: el PHP lo convertiría en 0 y devolvería la lista entera
    if (!Number.isInteger(id) || id <= 0) {
      this.message.set('Identificador de producto no válido.');
      return;
    }
    this.obtenerProducto(id);
  }

  obtenerProducto(id: number): void {
    this.productoService.get(id).subscribe({
      next: data => this.currentProducto.set(data),
      error: e => {
        console.error('[detalle] error', e.status);
        this.message.set('No se encontró el producto.');
      }
    });
  }

  actualizarProducto(): void {
    const producto = this.currentProducto();
    if (!producto?.id) return;
    console.log('[detalle] actualizando', producto);

    this.productoService.update(producto.id, producto).subscribe({
      next: () => {
        this.snackBar.open('Producto actualizado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: e => console.error('[detalle] error al actualizar', e)
    });
  }

  eliminarProducto(): void {
    const producto = this.currentProducto();
    if (!producto?.id) return;

    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productoService.delete(producto.id).subscribe({
        next: () => {
          this.router.navigate(['/productos']);
          this.snackBar.open('Producto eliminado correctamente', 'Cerrar', { duration: 3000 });
        },
        error: e => console.error('[detalle] error al borrar', e)
      });
    }
  }
}



