import { Injectable, signal } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs,   doc,
  updateDoc, } from '@angular/fire/firestore';
import { Route, Router } from '@angular/router';

export interface UsuarioLogado {
  id?: string;
  nome: string;
  email: string;
  nomeExibicao?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SessaoService {
  private usuarioAtual = signal<UsuarioLogado | null>(null);

  constructor(private firestore: Firestore, private router : Router) {
    const salvo = localStorage.getItem('usuarioLogado');
    if (salvo) {
      this.usuarioAtual.set(JSON.parse(salvo));
    }
  }

  async registrar(nome: string, email: string, senha: string): Promise<boolean> {
    const usuariosRef = collection(this.firestore, 'usuarios');

    // Verifica se email já existe
    const q = query(usuariosRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return false; // email já cadastrado
    }

    const docRef = await addDoc(usuariosRef, {
      nome,
      email,
      senha,
      nomeExibicao: nome
    });

    const usuario = { id: docRef.id, nome, email, nomeExibicao: nome };

    this.usuarioAtual.set(usuario);
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    return true;
  }

  async login(email: string, senha: string): Promise<boolean> {
    const usuariosRef = collection(this.firestore, 'usuarios');

    const q = query(
      usuariosRef,
      where('email', '==', email),
      where('senha', '==', senha) // simples, sem criptografia
    );

    const resultado = await getDocs(q);

    const docSnap = resultado.docs[0];
    const data = docSnap.data() as UsuarioLogado;

    const usuario: UsuarioLogado = {
      id: docSnap.id,
      nome: data.nome,
      email: data.email,
      nomeExibicao: data.nomeExibicao ?? data.nome
    };

    this.usuarioAtual.set(usuario);
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    return true;
  }

  async atualizarUsuario(usuario: UsuarioLogado) {
    if (!usuario.id) throw new Error('Usuário sem id não pode ser atualizado');

    const docRef = doc(this.firestore, `usuarios/${usuario.id}`);

    // Criar objeto de atualização sem o `id`. Você pode filtrar campos indesejados aqui.
    const { id, ...payload } = usuario;

    // Cast para any para contornar a tipagem específica do updateDoc
    await updateDoc(docRef, payload as any);

    // Atualiza sessão local e localStorage
    this.usuarioAtual.set(usuario);
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  }

  logout() {
    this.usuarioAtual.set(null);
    localStorage.removeItem('usuarioLogado');
    this.router.navigate([''])

  }

  getUsuario() {
    return this.usuarioAtual();
  }

  isLogado() {
    return this.usuarioAtual() !== null;
  }
}
