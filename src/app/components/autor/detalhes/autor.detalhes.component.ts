import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Firestore, collection, collectionData, docData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { doc } from 'firebase/firestore';
import { Autor } from '../../model/Autor';
import { Frase } from '../../model/Frase';
import { FraseCardComponent } from '../../frase/card/frase.card.component';

@Component({
  selector: 'app-autor-detalhe',
  standalone: true,
  imports: [CommonModule, FraseCardComponent, RouterLink],
  templateUrl: './autor.detalhes.component.html',
  styleUrls: ['./autor.detalhes.component.scss']
})
export class AutorDetalheComponent implements OnInit {
  private firestore = inject(Firestore);
  private route = inject(ActivatedRoute);

  autor$!: Observable<Autor | undefined>;
  frases$!: Observable<Frase[]>;

  categorias: string[] = [];
  temas: string[] = [];

  categoriasMap: Record<string, string> = {};
  temasMap: Record<string, string> = {};

  ngOnInit(): void {
    const autorId = this.route.snapshot.paramMap.get('id');
    if (!autorId) return;

    // Autor
    const autorRef = doc(this.firestore, `autores/${autorId}`);
    this.autor$ = docData(autorRef, { idField: 'id' }) as Observable<Autor>;

    // Frases do autor
    const frasesRef = collection(this.firestore, 'frases');
    const q = query(frasesRef, where('autorId', '==', autorId));
    this.frases$ = collectionData(q, { idField: 'id' }) as Observable<Frase[]>;

    // Categorias
    const categoriasRef = collection(this.firestore, 'categorias');
    collectionData(categoriasRef, { idField: 'id' }).subscribe((cats: any[]) => {
      cats.forEach(c => this.categoriasMap[c.id!] = c.nome);
    });

    // Temas
    const temasRef = collection(this.firestore, 'temas');
    collectionData(temasRef, { idField: 'id' }).subscribe((ts: any[]) => {
      ts.forEach(t => this.temasMap[t.id!] = t.nome);
    });

    // Extrair IDs únicos das frases
    this.frases$.subscribe(frases => {
      this.categorias = Array.from(new Set(frases.map(f => f.categoria ?? ''))).slice(0, 4);
      this.temas = Array.from(new Set(frases.map(f => f.temaId ?? ''))).slice(0, 4);
    });
  }

  // Filtra frases por categoria ou tema
  filtrarFrasesPorCampo(frases: Frase[], campo: 'categoria' | 'temaId', valor: string): Frase[] {
    return frases.filter(f => (f[campo] ?? '') === valor);
  }

  getCategoriaNome(id: string): string {
    return this.categoriasMap[id] ?? id;
  }

  getTemaNome(id: string): string {
    return this.temasMap[id] ?? id;
  }
}
