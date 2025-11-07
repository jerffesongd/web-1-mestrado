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
import { Tema } from '../model/Tema';
import { MensagemComponent } from '../mensagem/mensagem.component';
import { TipoMensagem } from '../model/TipoMensagem';
import { SessaoService } from '../../service/sessao.service';

@Component({
  selector: 'app-cadastro-tema',
  standalone: true,
  styleUrl: './cadastro.tema.component.scss',
  imports: [CommonModule, FormsModule, MensagemComponent],
  templateUrl: './cadastro.tema.component.html'
})
export class CadastroTemaComponent {
  temas$: Observable<Tema[]>;
  novoTema: Partial<Tema> = {};
  editandoId: string | null = null;

  mensagem: string | null = null;
  tipoMensagem: TipoMensagem | null = null;

  constructor(private firestore: Firestore, private sessaoService: SessaoService) {
    const temasRef = collection(this.firestore, 'temas');
    this.temas$ = collectionData(temasRef, { idField: 'id' }) as Observable<Tema[]>;
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
      if (!this.novoTema.nome || !this.novoTema.descricao) {
        this.exibirMensagem('Preencha todos os campos obrigatórios.', TipoMensagem.AVISO);
        return;
      }

      const temasRef = collection(this.firestore, 'temas');

      if (this.editandoId) {
        const docRef = doc(this.firestore, `temas/${this.editandoId}`);
        await updateDoc(docRef, {
          nome: this.novoTema.nome,
          descricao: this.novoTema.descricao
        });
        this.exibirMensagem('Tema atualizado com sucesso!', TipoMensagem.SUCESSO);
        this.editandoId = null;
      } else {
        await addDoc(temasRef, {
          nome: this.novoTema.nome,
          descricao: this.novoTema.descricao
        });
        this.exibirMensagem('Tema cadastrado com sucesso!', TipoMensagem.SUCESSO);
      }

      this.novoTema = {};
    } catch {
      this.exibirMensagem('Erro ao salvar o tema.', TipoMensagem.ERRO);
    }
  }

  async editar(id: string) {
    try {
      const docRef = doc(this.firestore, `temas/${id}`);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as Tema;
        this.novoTema = { nome: data.nome, descricao: data.descricao };
        this.editandoId = id;
        this.drawerAberto = true;
      }
    } catch {
      this.exibirMensagem('Erro ao carregar o tema para edição.', TipoMensagem.ERRO);
    }
  }

  async deletar(id: string) {
    if (!confirm('Tem certeza que deseja excluir este tema?')) return;

    try {
      const docRef = doc(this.firestore, `temas/${id}`);
      await deleteDoc(docRef);
      this.exibirMensagem('Tema excluído com sucesso!', TipoMensagem.SUCESSO);
    } catch {
      this.exibirMensagem('Erro ao excluir o tema.', TipoMensagem.ERRO);
    }
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.novoTema = {};
    this.exibirMensagem('Edição cancelada.', TipoMensagem.AVISO);
  }

  usuarioLogado(){
    return this.sessaoService.isLogado()
  }

  drawerAberto = false;

  abrirDrawer() {
    this.editandoId = null;
    this.novoTema = {};
    this.drawerAberto = true;
  }

  fecharDrawer() {
    this.drawerAberto = false;
  }
}
