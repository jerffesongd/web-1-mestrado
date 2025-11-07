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
import { SessaoService } from '../../service/sessao.service';
import { TipoMensagem } from '../model/TipoMensagem';
import { MensagemComponent } from '../mensagem/mensagem.component';

@Component({
  selector: 'app-cadastro-categoria',
  standalone: true,
  styleUrl: './cadastro.categoria.component.scss',
  imports: [CommonModule, FormsModule, MensagemComponent],
  templateUrl: './cadastro.categoria.component.html'
})
export class CadastroCategoriaComponent {
  categorias$: Observable<Categoria[]>;
  novaCategoria: Partial<Categoria> = {};
  editandoId: string | null = null;

  mensagem: string | null = null;
  tipoMensagem: TipoMensagem | null = null;

  constructor(private firestore: Firestore, private sessaoService: SessaoService) {
    const categoriasRef = collection(this.firestore, 'categorias');
    this.categorias$ = collectionData(categoriasRef, { idField: 'id' }) as Observable<Categoria[]>;
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
    try{
      const categoriasRef = collection(this.firestore, 'categorias');

      if (!this.novaCategoria.nome || !this.novaCategoria.descricao) {
        this.exibirMensagem('Preencha todos os campos obrigatórios.', TipoMensagem.AVISO);
        return;
      }

      if (this.editandoId) {
        // Atualizar categoria existente
        const docRef = doc(this.firestore, `categorias/${this.editandoId}`);
        await updateDoc(docRef, {
          nome: this.novaCategoria.nome,
          descricao: this.novaCategoria.descricao
        });
        this.exibirMensagem('Categoria atualizada com sucesso!', TipoMensagem.SUCESSO);
        this.editandoId = null;
      } else {
        // Criar nova categoria
        await addDoc(categoriasRef, {
          nome: this.novaCategoria.nome,
          descricao: this.novaCategoria.descricao
        });
        this.exibirMensagem('Categoria cadastrada com sucesso!', TipoMensagem.SUCESSO);
      }
      this.novaCategoria = {};
    }catch {
      this.exibirMensagem('Erro ao salvar a categoria.', TipoMensagem.ERRO);
    }
 
  }

  async editar(id: string) {
    try {
      const docRef = doc(this.firestore, `categorias/${id}`);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as Categoria;
        this.novaCategoria = { nome: data.nome, descricao: data.descricao };
        this.editandoId = id;
        this.drawerAberto = true;
      }
    } catch {
      this.exibirMensagem('Erro ao carregar o autor para edição.', TipoMensagem.ERRO);
    }
  }

  async deletar(id: string) {
    try {
      const docRef = doc(this.firestore, `categorias/${id}`);
      await deleteDoc(docRef);
      this.exibirMensagem('Categoria excluídoa com sucesso!', TipoMensagem.SUCESSO);
    } catch {
      this.exibirMensagem('Erro ao excluir a categoria.', TipoMensagem.ERRO);
    }

  }

  cancelarEdicao() {
    this.editandoId = null;
    this.exibirMensagem('Edição cancelada.', TipoMensagem.AVISO);
    this.novaCategoria = {};
  }

  usuarioLogado(){
    return this.sessaoService.isLogado()
  }

  drawerAberto = false;

  abrirDrawer() {
    this.editandoId = null;
    this.novaCategoria = {};
    this.drawerAberto = true;
  }

  fecharDrawer() {
    this.drawerAberto = false;
  }
}
