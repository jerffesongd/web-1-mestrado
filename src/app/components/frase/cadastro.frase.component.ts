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
import { MensagemComponent } from '../mensagem/mensagem.component';
import { TipoMensagem } from '../model/TipoMensagem';
import { Autor } from '../model/Autor';
import { Tema } from '../model/Tema';

export interface Frase {
  id?: string;
  texto: string;
  autorId: string;
  temaId: string;
  categoria: string;
}

@Component({
  selector: 'app-cadastro-frase',
  standalone: true,
  imports: [CommonModule, FormsModule, MensagemComponent],
  templateUrl: './cadastro.frase.component.html'
})
export class CadastroFraseComponent {
  frases$: Observable<Frase[]>;
  autores$: Observable<Autor[]>;
  temas$: Observable<Tema[]>;

  autoresSnapshot: Autor[] = [];
  temasSnapshot: Tema[] = [];

  novaFrase: Partial<Frase> = {};
  editandoId: string | null = null;

  mensagem: string | null = null;
  tipoMensagem: TipoMensagem | null = null;

  constructor(private firestore: Firestore) {
    const frasesRef = collection(this.firestore, 'frases');
    const autoresRef = collection(this.firestore, 'autores');
    const temasRef = collection(this.firestore, 'temas');

    this.frases$ = collectionData(frasesRef, { idField: 'id' }) as Observable<Frase[]>;
    this.autores$ = collectionData(autoresRef, { idField: 'id' }) as Observable<Autor[]>;
    this.temas$ = collectionData(temasRef, { idField: 'id' }) as Observable<Tema[]>;

    // Guardamos snapshots para uso nos métodos getAutorNome e getTemaNome
    this.autores$.subscribe(data => (this.autoresSnapshot = data));
    this.temas$.subscribe(data => (this.temasSnapshot = data));
  }

  private exibirMensagem(mensagem: string, tipo: TipoMensagem) {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = null;
      this.tipoMensagem = null;
    }, 3000);
  }

  async salvar() {
    try {
      if (
        !this.novaFrase.texto ||
        !this.novaFrase.autorId ||
        !this.novaFrase.temaId ||
        !this.novaFrase.categoria
      ) {
        this.exibirMensagem('Preencha todos os campos obrigatórios.', TipoMensagem.AVISO);
        return;
      }

      const frasesRef = collection(this.firestore, 'frases');

      if (this.editandoId) {
        const docRef = doc(this.firestore, `frases/${this.editandoId}`);
        await updateDoc(docRef, {
          texto: this.novaFrase.texto,
          autorId: this.novaFrase.autorId,
          temaId: this.novaFrase.temaId,
          categoria: this.novaFrase.categoria
        });
        this.exibirMensagem('Frase atualizada com sucesso!', TipoMensagem.SUCESSO);
        this.editandoId = null;
      } else {
        await addDoc(frasesRef, {
          texto: this.novaFrase.texto,
          autorId: this.novaFrase.autorId,
          temaId: this.novaFrase.temaId,
          categoria: this.novaFrase.categoria
        });
        this.exibirMensagem('Frase cadastrada com sucesso!', TipoMensagem.SUCESSO);
      }

      this.novaFrase = {};
    } catch (e) {
      console.error(e);
      this.exibirMensagem('Erro ao salvar a frase.', TipoMensagem.ERRO);
    }
  }

  async editar(id: string) {
    try {
      const docRef = doc(this.firestore, `frases/${id}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Frase;
        this.novaFrase = {
          texto: data.texto,
          autorId: data.autorId,
          temaId: data.temaId,
          categoria: data.categoria
        };
        this.editandoId = id;
      }
    } catch {
      this.exibirMensagem('Erro ao carregar a frase para edição.', TipoMensagem.ERRO);
    }
  }

  async deletar(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta frase?')) return;
    try {
      const docRef = doc(this.firestore, `frases/${id}`);
      await deleteDoc(docRef);
      this.exibirMensagem('Frase excluída com sucesso!', TipoMensagem.SUCESSO);
    } catch {
      this.exibirMensagem('Erro ao excluir a frase.', TipoMensagem.ERRO);
    }
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.novaFrase = {};
    this.exibirMensagem('Edição cancelada.', TipoMensagem.AVISO);
  }

  getAutorNome(id: string): string {
    const autor = this.autoresSnapshot.find(a => a.id === id);
    return autor ? `${autor.nome} ${autor.sobrenome}` : '';
  }

  getTemaNome(id: string): string {
    const tema = this.temasSnapshot.find(t => t.id === id);
    return tema ? tema.nome : '';
  }
}
