import { Component, signal } from '@angular/core';
import { SessaoService } from '../../service/sessao.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cadastro-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-usuario.component.html',
  styleUrl: './cadastro-usuario.component.scss'
})
export class CadastroUsuarioComponent {

  nome = '';
  email = '';
  senha = '';

  erro = signal<string | null>(null);
  sucesso = signal<string | null>(null);

  constructor(private sessaoService: SessaoService, private router: Router) {}

  registrar() {
    if (!this.nome.trim() || !this.email.trim() || !this.senha.trim()) {
      this.erro.set('Preencha todos os campos');
      return;
    }

    // Aqui você pode futuramente salvar no backend
    this.sessaoService.login(this.email, this.senha);

    this.sucesso.set('Cadastro realizado com sucesso!');
    this.erro.set(null);

    setTimeout(() => this.router.navigate(['/home']), 800);
  }
}