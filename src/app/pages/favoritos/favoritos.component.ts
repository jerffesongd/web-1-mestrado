import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FraseCardComponent } from '../../components/frase/card/frase.card.component';
import { Observable, of, switchMap } from 'rxjs';
import { Frase } from '../../components/model/Frase';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  CollectionReference,
  query,
  documentId,
  where
} from '@angular/fire/firestore';;
import { SessaoService } from '../../service/sessao.service';


@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, FraseCardComponent],
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.scss'
})
export class FavoritosComponent {
  
  frasesFavoritas$: Observable<Frase[]> = of([]);

  constructor(
    private firestore: Firestore,
    private sessaoService: SessaoService,
  ) { }

  ngOnInit(): void {
    const usuario = this.sessaoService.getUsuario();
    if (!usuario) return;

    const favRef = collection(this.firestore, `favoritos/${usuario.id}/frases`);

    this.frasesFavoritas$ = collectionData(favRef, { idField: 'id' }).pipe(
      switchMap((favoritos: any[]) => {
        const ids = favoritos
        .map(f => f.id)
        .filter((id: string | undefined) => !!id); 
        if (ids.length === 0) return of([]);

        const frasesRef = collection(this.firestore, 'frases') as CollectionReference<Frase>;
        const q = query(frasesRef, where(documentId(), 'in', ids));
        return collectionData(q, { idField: 'id' });
      })
    );
  }

}
