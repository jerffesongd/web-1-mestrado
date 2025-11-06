import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TipoMensagem } from '../model/TipoMensagem';

@Component({
  selector: 'app-mensagem',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (texto) {
      <div class="alert" [ngClass]="'alert-' + tipo">
        {{ texto }}
      </div>
    }
  `
})
export class MensagemComponent {
  @Input() texto: string | null = null;
  @Input() tipo: TipoMensagem | null = null;
}
