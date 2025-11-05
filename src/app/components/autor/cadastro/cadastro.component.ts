import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Autor } from '../../model/Autor';



@Component({
  selector: 'app-cadastro-autor',
  templateUrl: './cadastro.component.html',
  imports: [CommonModule, FormsModule]
})
export class CadastroAutorComponent {

  autores$: Observable<Autor[]>
  autores: Autor[] = [];
  novoAutor: Partial<Autor> = {};

  constructor(private firestore: Firestore) {
    const autoresRef = collection(this.firestore, 'autores');
    this.autores$ = collectionData(autoresRef, { idField: 'id' }) as Observable<Autor[]>;
  }

  async salvar() {
    if (this.novoAutor.nome && this.novoAutor.sobrenome) {
      const autoresRef = collection(this.firestore, 'autores');
      await addDoc(autoresRef, {
        nome: this.novoAutor.nome,
        sobrenome: this.novoAutor.sobrenome
      });
      this.novoAutor = {};
    }

  }

  editar(autor: Autor) {
    this.novoAutor = { ...autor };
  }

  async deletar(id: string) {
    const docRef = doc(this.firestore, `autores/${id}`);
    await deleteDoc(docRef);
  }
}
