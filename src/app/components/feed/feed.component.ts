import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { query, limit, CollectionReference } from 'firebase/firestore';
import { Autor } from '../model/Autor';
import { Frase } from '../model/Frase';
import { Tema } from '../model/Tema';
import { Categoria } from '../model/Categoria';
import { CommonModule } from '@angular/common';
import { FraseCardComponent } from '../frase/card/frase.card.component';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  standalone: true,
  imports: [CommonModule, FraseCardComponent, RouterLink]
})
export class FeedComponent implements OnInit {

  autores: Autor[] = [];
  frases: Frase[] = [];
  temas: Tema[] = [];
  categorias: Categoria[] = [];

  constructor(private firestore: Firestore, private router: Router) { }

  ngOnInit(): void {
    // ==================== AUTORES ====================
    const autoresRef = collection(this.firestore, 'autores') as CollectionReference<Autor>;
    const autoresQuery = query(autoresRef, limit(4));
    collectionData(autoresQuery, { idField: 'id' }).subscribe(autores => {
      this.autores = autores;
    });

    // ==================== TEMAS ====================
    const temasRef = collection(this.firestore, 'temas') as CollectionReference<Tema>;
    const temasQuery = query(temasRef, limit(4));
    collectionData(temasQuery, { idField: 'id' }).subscribe(temas => {
      this.temas = temas;
    });

    // ==================== CATEGORIAS ====================
    const categoriasRef = collection(this.firestore, 'categorias') as CollectionReference<Categoria>;
    const categoriasQuery = query(categoriasRef, limit(4));
    collectionData(categoriasQuery, { idField: 'id' }).subscribe(categorias => {
      this.categorias = categorias;
    });

    // ==================== FRASES ====================
    const frasesRef = collection(this.firestore, 'frases') as CollectionReference<Frase>;
    collectionData(frasesRef, { idField: 'id' }).subscribe(frases => {
      this.frases = frases;
    });
  }

  // ==================== NAVEGAÇÃO ====================
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

  // ==================== FILTRAR FRASES ====================
  filtrarFrases(tipo: 'categoria' | 'tema', id: string | undefined): Frase[] {
    if (!this.frases || !id) return [];

      console.log("******************************************************")
    console.log(this.frases
      .filter(f => (tipo === 'categoria' ? f.categoria === id : f.temaId === id))
      //.filter(f => !ids.has(f.id) && ids.add(f.id))
      .slice(0, 2))

      console.log("******************************************************")
    return this.frases
      .filter(f => (tipo === 'categoria' ? f.categoria === id : f.temaId === id))
      //.filter(f => !ids.has(f.id) && ids.add(f.id))
      .slice(0, 2); // limita a 2 frases
  }

}
