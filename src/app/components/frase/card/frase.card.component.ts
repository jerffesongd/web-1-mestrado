import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-frase-card',
  standalone: true,
  template: `
    <div class="d-flex justify-content-between align-items-center p-2 bg-dark text-light rounded mb-2">
      <span>{{ textoLimitado }}</span>
      <button class="btn btn-sm btn-outline-light" (click)="copiarTexto()">📋</button>
    </div>
  `,
  styles: [`
    div {
      font-size: 0.95rem;
    }
    button {
      font-size: 0.8rem;
    }
  `]
})
export class FraseCardComponent {
  @Input() texto: string = '';

  get textoLimitado(): string {
    if (!this.texto) return '';
    return this.texto.length > 30 ? this.texto.substring(0, 30) + '...' : this.texto;
  }

  copiarTexto() {
    navigator.clipboard.writeText(this.texto);
    alert('Frase copiada!');
  }
}
