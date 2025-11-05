import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CadastroAutorComponent } from './components/autor/cadastro/cadastro.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'autor/crud', component: CadastroAutorComponent },
    { path: '**', redirectTo: '' }
];
