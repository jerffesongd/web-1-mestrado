import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-frase-card',
  standalone: true,
  template: `
    <div class="p-2 bg-dark text-light rounded mb-2">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span>{{ textoLimitado }}</span>
        <button class="btn btn-sm btn-outline-light" (click)="copiarTexto()">
          <i class="fas fa-clipboard"></i>
        </button>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-success" (click)="compartilhar('whatsapp')">
          <i class="fab fa-whatsapp"></i>
        </button>
        <button class="btn btn-sm btn-outline-info" (click)="compartilhar('twitter')">
          <i class="fab fa-twitter"></i>
        </button>
        <button class="btn btn-sm btn-outline-primary" (click)="compartilhar('facebook')">
          <i class="fab fa-facebook-f"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary" (click)="compartilhar('linkedin')">
          <i class="fab fa-linkedin-in"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    div {
      font-size: 0.95rem;
    }
    button {
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    i {
      pointer-events: none;
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

  compartilhar(rede: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin') {
    const textoEncoded = encodeURIComponent(this.texto);
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
}
