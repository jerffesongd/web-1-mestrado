import { Component, signal } from '@angular/core';
import { SessaoService } from '../../service/sessao.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = signal<string | null>(null);

  constructor(private sessaoService: SessaoService, private router: Router) {}

  async fazerLogin() {
    const sucesso = await this.sessaoService.login(this.email, this.senha);

    if (!sucesso) {
      this.erro.set('Usuário ou senha inválidos');
      return;
    }

    this.router.navigate(['/home']);
  }
}