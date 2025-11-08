import { Component, inject, Input } from '@angular/core';
import { Frase } from '../../model/Frase';
import { SessaoService, UsuarioLogado } from '../../../service/sessao.service';
import { addDoc, collectionData, deleteDoc, doc, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Autor } from '../../model/Autor';
import { Tema } from '../../model/Tema';
import { Categoria } from '../../model/Categoria';
import { CommonModule } from '@angular/common';
import { FavoritoService } from '../../../service/favorito.service';
import { FormsModule } from '@angular/forms';
import { TipoMensagem } from '../../model/TipoMensagem';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-frase-card',
  templateUrl: './frase.card.component.html',
  styleUrls: ['./frase.card.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule,MatTooltipModule]
})
export class FraseCardComponent {

  frases$: Observable<Frase[]>;
  autores$: Observable<Autor[]>;
  temas$: Observable<Tema[]>;
  private _snackBar = inject(MatSnackBar);

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
  @Input() frase: Frase | undefined;

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
    this.sessaoService.fecharDrawer$.subscribe(() => {
      this.drawerAberto = false;
    });
  }

  get textoLimitado(): string {
    if (!this.frase) return '';
    return this.frase.texto.length > 30 ? this.frase.texto.substring(0, 30) + '...' : this.frase.texto;
  }

  copiarTexto() {
    navigator.clipboard.writeText(this.frase?.texto || '');
    this._snackBar.open("Frase copiada!", undefined, {
      duration: 3000, // tempo em milissegundos (3s)
    });
  }

  compartilhar(rede: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin') {
    const textoEncoded = encodeURIComponent(this.frase?.texto || '');
    let url = '';

    switch (rede) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${textoEncoded}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${textoEncoded}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${textoEncoded}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${textoEncoded}`;
        break;
    }

    window.open(url, '_blank');
  }


  getAutorNome(): string {
    const autor = this.autoresSnapshot.find(a => a.id === this.frase?.autorId);
    return autor ? `${autor.nome} ${autor.sobrenome}` : '';
  }

  getTemaNome(): string {
    const tema = this.temasSnapshot.find(t => t.id === this.frase?.temaId);
    return tema ? tema.nome : '';
  }

  getCategoriaNome(): string {
    const categoria = this.categoriasSnapshot.find(t => t.id === this.frase?.categoria);
    return categoria ? categoria.nome : '';
  }

  getUsuarioNome(): string {
    const usuario = this.usuariosSnapshot.find(u => u.id === this.frase?.criadoPor);
    return usuario ? usuario.nomeExibicao ?? usuario.nome : '—';
  }

  usuarioLogado() {
    return this.sessaoService.isLogado()
  }

  isFavorito(id: string): boolean {
    return this.favoritoService.isFavorito(id);
  }

  toggleFavorito(id: string) {
    this.favoritoService.toggleFavorito(id);
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
  
  async editar(id: string) {
    try {
      const docRef = doc(this.firestore, `frases/${id}`);
      this.sessaoService.fecharTodos();
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
        this.drawerAberto = true;
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

  drawerAberto = false;

  abrirDrawer() {
    this.sessaoService.fecharTodos(); // ✅ fecha os outros drawers
    this.editandoId = null;
    this.novaFrase = {};
    this.drawerAberto = true;
  }

  fecharDrawer() {
    this.drawerAberto = false;
  }

  private exibirMensagem(mensagem: string, tipo: TipoMensagem) {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = null;
      this.tipoMensagem = null;
    }, 3000);
  }
}
