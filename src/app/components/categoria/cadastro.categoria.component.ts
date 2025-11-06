import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Categoria } from '../model/Categoria';

@Component({
  selector: 'app-cadastro-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro.categoria.component.html'
})
export class CadastroCategoriaComponent {
  categorias$: Observable<Categoria[]>;
  novaCategoria: Partial<Categoria> = {};
  editandoId: string | null = null;

  constructor(private firestore: Firestore) {
    const categoriasRef = collection(this.firestore, 'categorias');
    this.categorias$ = collectionData(categoriasRef, { idField: 'id' }) as Observable<Categoria[]>;
  }

  async salvar() {
    const categoriasRef = collection(this.firestore, 'categorias');

    if (!this.novaCategoria.nome || !this.novaCategoria.descricao) return;

    if (this.editandoId) {
      // Atualizar categoria existente
      const docRef = doc(this.firestore, `categorias/${this.editandoId}`);
      await updateDoc(docRef, {
        nome: this.novaCategoria.nome,
        descricao: this.novaCategoria.descricao
      });
      this.editandoId = null;
    } else {
      // Criar nova categoria
      await addDoc(categoriasRef, {
        nome: this.novaCategoria.nome,
        descricao: this.novaCategoria.descricao
      });
    }

    this.novaCategoria = {};
  }

  async editar(id: string) {
    const docRef = doc(this.firestore, `categorias/${id}`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as Categoria;
      this.novaCategoria = { nome: data.nome, descricao: data.descricao };
      this.editandoId = id;
    }
  }

  async deletar(id: string) {
    const docRef = doc(this.firestore, `categorias/${id}`);
    await deleteDoc(docRef);
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.novaCategoria = {};
  }
}
