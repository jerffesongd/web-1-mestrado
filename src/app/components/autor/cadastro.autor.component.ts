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
import { Autor } from '../model/Autor';
import { MensagemComponent } from '../mensagem/mensagem.component';
import { TipoMensagem } from '../model/TipoMensagem';

@Component({
  selector: 'app-cadastro-autor',
  standalone: true,
  imports: [CommonModule, FormsModule, MensagemComponent],
  templateUrl: './cadastro.autor.component.html'
})
export class CadastroAutorComponent {
  autores$: Observable<Autor[]>;
  novoAutor: Partial<Autor> = {};
  editandoId: string | null = null;

  mensagem: string | null = null;
  tipoMensagem: TipoMensagem | null = null;

  constructor(private firestore: Firestore) {
    const autoresRef = collection(this.firestore, 'autores');
    this.autores$ = collectionData(autoresRef, { idField: 'id' }) as Observable<Autor[]>;
  }

  private exibirMensagem(mensagem: string, tipo: TipoMensagem) {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;

    // Mensagem desaparece automaticamente após 3 segundos
    setTimeout(() => {
      this.mensagem = null;
      this.tipoMensagem = null;
    }, 3000);
  }

  async salvar() {
    try {
      if (!this.novoAutor.nome || !this.novoAutor.sobrenome) {
        this.exibirMensagem('Preencha todos os campos obrigatórios.', TipoMensagem.AVISO);
        return;
      }

      const autoresRef = collection(this.firestore, 'autores');

      if (this.editandoId) {
        const docRef = doc(this.firestore, `autores/${this.editandoId}`);
        await updateDoc(docRef, {
          nome: this.novoAutor.nome,
          sobrenome: this.novoAutor.sobrenome
        });
        this.exibirMensagem('Autor atualizado com sucesso!', TipoMensagem.SUCESSO);
        this.editandoId = null;
      } else {
        await addDoc(autoresRef, {
          nome: this.novoAutor.nome,
          sobrenome: this.novoAutor.sobrenome
        });
        this.exibirMensagem('Autor cadastrado com sucesso!', TipoMensagem.SUCESSO);
      }

      this.novoAutor = {};
    } catch {
      this.exibirMensagem('Erro ao salvar o autor.', TipoMensagem.ERRO);
    }
  }

  async editar(id: string) {
    try {
      const docRef = doc(this.firestore, `autores/${id}`);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as Autor;
        this.novoAutor = { nome: data.nome, sobrenome: data.sobrenome };
        this.editandoId = id;
      }
    } catch {
      this.exibirMensagem('Erro ao carregar o autor para edição.', TipoMensagem.ERRO);
    }
  }

  async deletar(id: string) {
    if (!confirm('Tem certeza que deseja excluir este autor?')) return;

    try {
      const docRef = doc(this.firestore, `autores/${id}`);
      await deleteDoc(docRef);
      this.exibirMensagem('Autor excluído com sucesso!', TipoMensagem.SUCESSO);
    } catch {
      this.exibirMensagem('Erro ao excluir o autor.', TipoMensagem.ERRO);
    }
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.novoAutor = {};
    this.exibirMensagem('Edição cancelada.', TipoMensagem.AVISO);
  }
}
