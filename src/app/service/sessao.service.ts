import { Injectable, signal } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';

export interface UsuarioLogado {
  id?: string;
  nome: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class SessaoService {
  private usuarioAtual = signal<UsuarioLogado | null>(null);

  constructor(private firestore: Firestore) {
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

    await addDoc(usuariosRef, { nome, email, senha });

    this.usuarioAtual.set({ nome, email });
    localStorage.setItem('usuarioLogado', JSON.stringify(this.usuarioAtual));
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

    if (resultado.empty) return false;

    const usuario = resultado.docs[0].data() as UsuarioLogado;

    this.usuarioAtual.set(usuario);
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    return true;
  }

  logout() {
    console.log("chegou em logout")
    this.usuarioAtual.set(null);
    localStorage.removeItem('usuarioLogado');
  }

  getUsuario() {
    return this.usuarioAtual();
  }

  isLogado() {
    return this.usuarioAtual() !== null;
  }
}
