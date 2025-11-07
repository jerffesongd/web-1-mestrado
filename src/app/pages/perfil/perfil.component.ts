import { Component, signal } from '@angular/core';
import { SessaoService, UsuarioLogado } from '../../service/sessao.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {

  usuario = signal<UsuarioLogado | null>(null);
  mensagemSucesso = signal<string | null>(null);
  mensagemErro = signal<string | null>(null);

  constructor(private sessaoService: SessaoService) {
    this.usuario.set(this.sessaoService.getUsuario());
  }

  async salvar() {
    const usuario = this.usuario();

    if (!usuario) {
      this.mensagemErro.set('Nenhum usuário logado.');
      return;
    }

    try {
      await this.sessaoService.atualizarUsuario(usuario);
      this.mensagemSucesso.set('Dados atualizados com sucesso!');
      this.mensagemErro.set(null);

      setTimeout(() => (this.mensagemSucesso.set(null)), 2000);
    } catch (e) {
      this.mensagemErro.set('Erro ao salvar as alterações.');
    }
  }

  async deletar(){
    try {
      await this.sessaoService.excluirUsuarioLogado();
      this.mensagemSucesso.set('Dados atualizados com sucesso!');
      this.mensagemErro.set(null);

      setTimeout(() => (this.mensagemSucesso.set(null)), 2000);
    } catch (e) {
      this.mensagemErro.set('Erro ao salvar as alterações.');
    }

  }
}