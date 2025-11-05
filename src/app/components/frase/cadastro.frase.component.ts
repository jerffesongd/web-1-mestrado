import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Frase } from '../model/Frase';
import { Autor } from '../model/Autor';

@Component({
    selector: 'app-cadastro-frase',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cadastro.frase.component.html'
})
export class CadastroFraseComponent {
    frases$: Observable<Frase[]>;
    autores$: Observable<Autor[]>;
    novaFrase: Partial<Frase> = {};

    constructor(private firestore: Firestore) {
        const frasesRef = collection(this.firestore, 'frases');
        const autoresRef = collection(this.firestore, 'autores');

        this.frases$ = collectionData(frasesRef, { idField: 'id' }) as Observable<Frase[]>;
        this.autores$ = collectionData(autoresRef, { idField: 'id' }) as Observable<Autor[]>;

        this.autores$.subscribe(autores => {
            console.log('Autores carregados:', autores);
        });
    }

    async salvar() {
        if (this.novaFrase.texto && this.novaFrase.autorId) {
            const frasesRef = collection(this.firestore, 'frases');
            await addDoc(frasesRef, {
                texto: this.novaFrase.texto,
                autorId: this.novaFrase.autorId
            });
            this.novaFrase = {};
        }
    }

    async deletar(id: string) {
        const docRef = doc(this.firestore, `frases/${id}`);
        await deleteDoc(docRef);
    }

    getAutorNome(autorId: string, autores: Autor[]): string {
        const autor = autores.find(a => a.id === autorId);
        return autor ? `${autor.nome} ${autor.sobrenome}` : '';
    }
}
