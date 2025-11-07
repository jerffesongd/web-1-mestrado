import { Component } from '@angular/core';
import { SessaoService } from '../../service/sessao.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {


  constructor(private sessaoService: SessaoService){}

  usuarioLogado() {
    return this.sessaoService.isLogado();
  }

  logout() {
    this.sessaoService.logout();
  }

}
