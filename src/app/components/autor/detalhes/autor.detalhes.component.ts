import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, collectionData, docData, query, where } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { doc } from 'firebase/firestore';
import { Autor } from '../../model/Autor';
import { Frase } from '../../model/Frase';

@Component({
  selector: 'app-autor-detalhe',
  standalone: true,
  imports: [CommonModule],
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

  constructor() {}

  ngOnInit(): void {
    const autorId = this.route.snapshot.paramMap.get('id');
    if (!autorId) return;

    const autorRef = doc(this.firestore, `autores/${autorId}`);
    this.autor$ = docData(autorRef, { idField: 'id' }) as Observable<Autor>;

    // Buscar frases do autor
    const frasesRef = collection(this.firestore, 'frases');
    const q = query(frasesRef, where('autorId', '==', autorId));
    this.frases$ = collectionData(q, { idField: 'id' }) as Observable<Frase[]>;

    // Extrair categorias e temas dinamicamente
    this.frases$.subscribe(frases => {
        console.log(frases)
      this.categorias = Array.from(new Set(frases.map(f => f.categoria ?? ''))).slice(0, 4);
      this.temas = Array.from(new Set(frases.map(f => f.temaId ?? ''))).slice(0, 4);
    });


  }

  // Filtra frases de forma segura, ignorando maiúsculas/minúsculas
  filtrarFrasesPorCampo(frases: Frase[], campo: 'categoria' | 'temaId', valor: string): Frase[] {
    return frases.filter(f => (f[campo] ?? '').toLowerCase() === valor.toLowerCase());
  }
}
