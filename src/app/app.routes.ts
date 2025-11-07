import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CadastroFraseComponent } from './components/frase/cadastro.frase.component';
import { CadastroCategoriaComponent } from './components/categoria/cadastro.categoria.component';
import { CadastroTemaComponent } from './components/tema/cadastro.tema.component';
import { CadastroAutorComponent } from './components/autor/cadastro.autor.component';
import { LoginComponent } from './pages/login/login.component';
import { CadastroUsuarioComponent } from './pages/cadastro-usuario/cadastro-usuario.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'autor/crud', component: CadastroAutorComponent },
    { path: 'frases/crud', component: CadastroFraseComponent },
    { path: 'categorias/crud', component: CadastroCategoriaComponent },
    { path: 'temas/crud', component: CadastroTemaComponent },
    { path: 'login', component: LoginComponent },
    { path: 'usuario/cadastro', component: CadastroUsuarioComponent },
    { path: '**', redirectTo: '' }
];
