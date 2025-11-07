import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, collectionData, doc, docData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Categoria } from '../../model/Categoria';
import { Frase } from '../../model/Frase';
import { FraseCardComponent } from '../../frase/card/frase.card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categoria-detalhe',
  standalone: true,
  imports: [CommonModule, FraseCardComponent, RouterLink],
  templateUrl: './categoria.frases.component.html',
  styleUrls: ['./categoria.frases.component.scss']
})
export class CategoriaFrasesComponent implements OnInit {
  private firestore = inject(Firestore);
  private route = inject(ActivatedRoute);

  categoria$!: Observable<Categoria | undefined>;
  frases$!: Observable<Frase[]>;

  constructor() {}

  ngOnInit(): void {
    const categoriaId = this.route.snapshot.paramMap.get('id');
    if (!categoriaId) return;

    // Buscar categoria pelo ID
    const categoriaRef = doc(this.firestore, `categorias/${categoriaId}`);
    this.categoria$ = docData(categoriaRef, { idField: 'id' }) as Observable<Categoria>;

    // Buscar todas as frases da categoria
    const frasesRef = collection(this.firestore, 'frases');
    const q = query(frasesRef, where('categoria', '==', categoriaId));
    this.frases$ = collectionData(q, { idField: 'id' }) as Observable<Frase[]>;
  }
}
