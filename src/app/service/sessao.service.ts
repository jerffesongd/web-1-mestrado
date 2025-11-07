import { Injectable } from '@angular/core';

export interface UsuarioLogado {
  nome: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class SessaoService {
  private usuarioAtual: UsuarioLogado | null = null;

  constructor() {
    const salvo = localStorage.getItem('usuarioLogado');
    if (salvo) this.usuarioAtual = JSON.parse(salvo);
  }

  login(email: string, senha: string): boolean {
    if (email.trim() === '' || senha.trim() === '') {
      return false;
    }

    // Dados mockados — simulação
    this.usuarioAtual = {
      nome: 'Usuário de Teste',
      email,
    };

    localStorage.setItem('usuarioLogado', JSON.stringify(this.usuarioAtual));
    return true;
  }

  logout() {
    this.usuarioAtual = null;
    localStorage.removeItem('usuarioLogado');
  }

  getUsuario(): UsuarioLogado | null {
    return this.usuarioAtual;
  }

  isLogado(): boolean {
    return this.usuarioAtual !== null;
  }
}
