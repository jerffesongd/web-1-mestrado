import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, collectionData, doc, docData, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Frase } from '../../model/Frase';
import { Tema } from '../../model/Tema';
import { FraseCardComponent } from '../../frase/card/frase.card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tema-detalhe',
  standalone: true,
  imports: [CommonModule, FraseCardComponent],
  templateUrl: './tema.frases.component.html',
  styleUrls: ['./tema.frases.component.scss']
})
export class TemaFrasesComponent implements OnInit {
  private firestore = inject(Firestore);
  private route = inject(ActivatedRoute);

  tema$!: Observable<Tema | undefined>;
  frases$!: Observable<Frase[]>;

  constructor() {}

  ngOnInit(): void {
    const temaId = this.route.snapshot.paramMap.get('id');
    if (!temaId) return;

    // Buscar tema pelo ID
    const temaRef = doc(this.firestore, `temas/${temaId}`);
    this.tema$ = docData(temaRef, { idField: 'id' }) as Observable<Tema>;

    // Buscar todas as frases do tema
    const frasesRef = collection(this.firestore, 'frases');
    const q = query(frasesRef, where('temaId', '==', temaId));
    this.frases$ = collectionData(q, { idField: 'id' }) as Observable<Frase[]>;
  }
}
