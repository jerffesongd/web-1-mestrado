import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FraseCardComponent } from '../../frase/card/frase.card.component';
import { Categoria } from '../../model/Categoria';
import { Frase } from '../../model/Frase';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FraseCardComponent],
  templateUrl: './categorias-list.component.html',
  styleUrls: ['./categorias-list.component.scss']
})
export class CategoriasListComponent implements OnInit {

  private firestore = inject(Firestore);
  private router = inject(Router);

  categorias$!: Observable<Categoria[]>;
  frases$!: Observable<Frase[]>;

  ngOnInit(): void {
    const categoriasRef = collection(this.firestore, 'categorias');
    const frasesRef = collection(this.firestore, 'frases');

    this.categorias$ = collectionData(categoriasRef, { idField: 'id' }) as Observable<Categoria[]>;
    this.frases$ = collectionData(frasesRef, { idField: 'id' }) as Observable<Frase[]>;
  }

  filtrarFrases(frases: Frase[], categoriaId: string): Frase[] {
    return frases.filter(f => f.categoria === categoriaId).slice(0, 3); // mostrar até 3 frases
  }

  verMaisCategoria(id?: string) {
    if (!id) return;
    this.router.navigate(['/categorias', id]);
  }
}
