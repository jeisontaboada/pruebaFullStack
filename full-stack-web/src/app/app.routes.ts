import { Routes } from '@angular/router';
import { MenuComponent } from './pages/menu/menu.component';

import { ClienteComponent } from './pages/cliente/comanda.component';

export const routes: Routes = [
  {
    path: 'menu',
    component: MenuComponent,
    children: [
      { path: 'cliente', component: ClienteComponent },
    ],
  },

  { path: '**', redirectTo: 'menu' },
];
