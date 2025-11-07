import { Component, Input } from '@angular/core';
import { Frase } from '../../model/Frase';
import { SessaoService, UsuarioLogado } from '../../../service/sessao.service';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Autor } from '../../model/Autor';
import { Tema } from '../../model/Tema';
import { Categoria } from '../../model/Categoria';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-frase-card',
  templateUrl: './frase.card.component.html',
  styleUrls: ['./frase.card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class FraseCardComponent {

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
  @Input() frase: Frase | undefined;

  constructor(
    private firestore: Firestore,
    private sessaoService: SessaoService // ✅ pegando o usuário logado
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

  get textoLimitado(): string {
    if (!this.frase) return '';
    return this.frase.texto.length > 30 ? this.frase.texto.substring(0, 30) + '...' : this.frase.texto;
  }

  copiarTexto() {
    navigator.clipboard.writeText(this.frase?.texto || '');
    alert('Frase copiada!');
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
}
