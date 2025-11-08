import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, take } from 'rxjs';
import { MensagemComponent } from '../mensagem/mensagem.component';
import { TipoMensagem } from '../model/TipoMensagem';
import { Autor } from '../model/Autor';
import { Tema } from '../model/Tema';
import { Frase } from '../model/Frase';
import { SessaoService, UsuarioLogado } from '../../service/sessao.service';
import { Categoria } from '../model/Categoria';
import { FavoritoService } from '../../service/favorito.service';
import { FraseCardComponent } from './card/frase.card.component';



@Component({
  selector: 'app-cadastro-frase',
  standalone: true,
  imports: [CommonModule, FormsModule, MensagemComponent, FraseCardComponent],
  styleUrl: './cadastro.frase.component.scss',
  templateUrl: './cadastro.frase.component.html'
})
export class CadastroFraseComponent {
  frases$: Observable<Frase[]>;
  autores$: Observable<Autor[]>;
  temas$: Observable<Tema[]>;

  categorias$: Observable<Categoria[]>;
  
  usuarios$: Observable<UsuarioLogado[]>;
  usuariosSnapshot: UsuarioLogado[] = [];

  autoresSnapshot: Autor[] = [];
  temasSnapshot: Tema[] = [];
  categoriasSnapshot: Tema[] = [];

  novaFrase: Partial<Frase> = {};
  editandoId: string | null = null;

  mensagem: string | null = null;
  tipoMensagem: TipoMensagem | null = null;

  constructor(
    private firestore: Firestore,
    private sessaoService: SessaoService, // ✅ pegando o usuário logado
    private favoritoService: FavoritoService
  ) {
    const frasesRef = collection(this.firestore, 'frases');
    const autoresRef = collection(this.firestore, 'autores');
    const temasRef = collection(this.firestore, 'temas');
    const categoriasRef = collection(this.firestore, 'categorias');

    this.frases$ = collectionData(frasesRef, { idField: 'id' }) as Observable<Frase[]>;
    this.autores$ = collectionData(autoresRef, { idField: 'id' }) as Observable<Autor[]>;
    this.temas$ = collectionData(temasRef, { idField: 'id' }) as Observable<Tema[]>;
    this.categorias$ = collectionData(categoriasRef, { idField: 'id' }) as Observable<Tema[]>;

    this.autores$.subscribe(data => (this.autoresSnapshot = data));
    this.temas$.subscribe(data => (this.temasSnapshot = data));
    this.categorias$.subscribe(data => (this.categoriasSnapshot = data));

    const usuariosRef = collection(this.firestore, 'usuarios');
    this.usuarios$ = collectionData(usuariosRef, { idField: 'id' }) as Observable<UsuarioLogado[]>;

    this.usuarios$.subscribe(data => (this.usuariosSnapshot = data));
    
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

      const usuario = this.sessaoService.getUsuario();
      if (!usuario) {
        this.exibirMensagem('Você precisa estar logado para cadastrar frases.', TipoMensagem.ERRO);
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
          categoria: this.novaFrase.categoria,
          criadoPor: usuario.id,              // ✅ aqui salvamos o usuário que criou a frase
          criadoEm: serverTimestamp()               // opcional: timestamp
        });

        this.exibirMensagem('Frase cadastrada com sucesso!', TipoMensagem.SUCESSO);
      }

      this.novaFrase = {};
    } catch (e) {
      console.error(e);
      this.exibirMensagem('Erro ao salvar a frase.', TipoMensagem.ERRO);
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

  getCategoriaNome(id: string): string {
    const categoria = this.categoriasSnapshot.find(t => t.id === id);
    return categoria ? categoria.nome : '';
  }

  getUsuarioNome(id: string): string {
    const usuario = this.usuariosSnapshot.find(u => u.id === id);
    return usuario ? usuario.nomeExibicao ?? usuario.nome : '—';
  }

  usuarioLogado(){
    return this.sessaoService.isLogado()
  }

  drawerAberto = false;

  abrirDrawer() {
    this.editandoId = null;
    this.novaFrase = {};
    this.drawerAberto = true;
  }

  fecharDrawer() {
    this.drawerAberto = false;
  }

  isFavorito(id: string): boolean {
    return this.favoritoService.isFavorito(id);
  }

  toggleFavorito(id: string) {
    this.favoritoService.toggleFavorito(id);
  }
}