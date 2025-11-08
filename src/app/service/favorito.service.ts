import { Injectable, signal } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs,   doc,
  updateDoc,
  deleteDoc,
  setDoc,
  docData,
  collectionData, } from '@angular/fire/firestore';
import { SessaoService } from './sessao.service';
import { map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private favoritos = new Set<string>();

  constructor(
    private sessaoService: SessaoService,
    private firestore: Firestore
  ) {
    this.init(); // carrega só uma vez
  }

  private init() {
    const usuario = this.sessaoService.getUsuario();
    if (!usuario) return;

    const favRef = collection(this.firestore, `favoritos/${usuario.id}/frases`);

    // único subscribe
    collectionData(favRef, { idField: 'id' }).subscribe(favs => {
      this.favoritos = new Set(favs.map(f => f["id"]));
      console.log("Favoritos carregados:", [...this.favoritos]);
    });
  }

  isFavorito(fraseId: string): boolean {
    return this.favoritos.has(fraseId);
  }

  async toggleFavorito(fraseId: string) {
    const usuario = this.sessaoService.getUsuario();
    if (!usuario) return;

    const favRef = doc(this.firestore, `favoritos/${usuario.id}/frases/${fraseId}`);

    if (this.isFavorito(fraseId)) {
      this.favoritos.delete(fraseId);
      await deleteDoc(favRef);
    } else {
      this.favoritos.add(fraseId);
      await setDoc(favRef, { favorito: true });
    }
  }
}