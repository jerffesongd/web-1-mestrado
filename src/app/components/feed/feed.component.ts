import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Autor } from '../model/Autor';
import { Frase } from '../model/Frase';
import { Tema } from '../model/Tema';
import { Categoria } from '../model/Categoria';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class FeedComponent implements OnInit {
  autores$!: Observable<Autor[]>;
  frases$!: Observable<Frase[]>;
  temas$!: Observable<Tema[]>;
  categorias$!: Observable<Categoria[]>;

  constructor(private firestore: Firestore, private router: Router) {}

  ngOnInit(): void {
    const autoresRef = collection(this.firestore, 'autores');
    const frasesRef = collection(this.firestore, 'frases');
    const temasRef = collection(this.firestore, 'temas');
    const categoriasRef = collection(this.firestore, 'categorias');

    this.autores$ = collectionData(autoresRef, { idField: 'id' }) as Observable<Autor[]>;
    this.frases$ = collectionData(frasesRef, { idField: 'id' }) as Observable<Frase[]>;
    this.temas$ = collectionData(temasRef, { idField: 'id' }) as Observable<Tema[]>;
    this.categorias$ = collectionData(categoriasRef, { idField: 'id' }) as Observable<Categoria[]>;
  }

  // Navegação segura
  verMaisAutor(id?: string) {
    if (id) this.router.navigate(['/autor', id]);
  }

  verMaisCategoria(id?: string) {
    if (id) this.router.navigate(['/categoria', id]);
  }

  verMaisTema(id?: string) {
    if (id) this.router.navigate(['/tema', id]);
  }

  verMaisFrase(id?: string) {
    if (id) this.router.navigate(['/frase', id]);
  }

  filtrarFrases(frases: Frase[], tipo: 'categoria' | 'tema', id: string): Frase[] {
    if (!frases || !id) return [];
    return frases
      .filter(f => (tipo === 'categoria' ? f.categoria === id : f.temaId === id))
      .slice(0, 2);
  }
}
