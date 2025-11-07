import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Tema } from '../../model/Tema';
import { Frase } from '../../model/Frase';
import { FraseCardComponent } from '../../frase/card/frase.card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-temas-list',
  standalone: true,
  imports: [CommonModule, FraseCardComponent],
  templateUrl: './tema-list.component.html',
  styleUrls: ['./tema-list.component.scss']
})
export class TemasListComponent implements OnInit {
  private firestore = inject(Firestore);

  temas$!: Observable<Tema[]>;
  frases$!: Observable<Frase[]>;

  constructor() {}

  ngOnInit(): void {
    const temasRef = collection(this.firestore, 'temas');
    const frasesRef = collection(this.firestore, 'frases');

    // Listar todos os temas
    this.temas$ = collectionData(temasRef, { idField: 'id' }) as Observable<Tema[]>;

    // Listar todas as frases
    this.frases$ = collectionData(frasesRef, { idField: 'id' }) as Observable<Frase[]>;
  }

  filtrarFrases(frases: Frase[], temaId: string): Frase[] {
    return frases.filter(f => f.temaId === temaId);
  }

  verMaisTema(temaId: string) {
    // navegação para tema/:id
  }
}
