import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';
import { Autor } from '../../model/Autor';
import { Frase } from '../../model/Frase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-autores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './autores.component.html',
  styleUrls: ['./autores.component.scss']
})
export class AutoresComponent implements OnInit {

  constructor(private firestore: Firestore, private router: Router) { }

  autoresComFrases$!: Observable<{ autor: Autor; totalFrases: number }[]>;

  ngOnInit(): void {
    const autoresRef = collection(this.firestore, 'autores');
    const frasesRef = collection(this.firestore, 'frases');

    const autores$ = collectionData(autoresRef, { idField: 'id' }) as Observable<Autor[]>;
    const frases$ = collectionData(frasesRef, { idField: 'id' }) as Observable<Frase[]>;

    this.autoresComFrases$ = combineLatest([autores$, frases$]).pipe(
      map(([autores, frases]) =>
        autores.map(autor => ({
          autor,
          totalFrases: frases.filter(f => f.autorId === autor.id).length
        }))
      )
    );
  }

  verDetalhesAutor(id?: string) {
    if (!id) return;
    this.router.navigate(['/autores', id]);
  }
}
