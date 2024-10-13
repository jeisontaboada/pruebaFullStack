import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SdkService } from '../../services/sdk.service';
import Clientes from '../../interfaces/cliente';

@Component({
  selector: 'app-comanda',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './comanda.component.html',
})
export class ClienteComponent implements OnInit {
  sdk = inject(SdkService);
  listClientes = signal<Clientes[]>([]);

  token: string = '';
  clientData = { nombre: '', email: '' };
  message: string = '';

  displayedColumns: string[] = ['position', 'nombre', 'email', 'acciones'];

  ngOnInit() {
    this.getToken();
    this.getClientes();
  }

  getToken(): void {
    this.sdk.getToken().subscribe({
      next: (response) => {
        this.token = response.token;
      },
      error: (error) => {
        console.error('Error al obtener el token:', error);
      },
    });
  }

  getClientes() {
    this.sdk.getClientes().subscribe({
      next: (data: any) => {
        this.listClientes.set(data);
      },

      error: (err: any) => {
        console.log(err);
      },
    });
  }
  isTokenValid(): boolean {
    return this.token.length === 8;
  }

  registrarCliente() {
    if (!this.isTokenValid()) {
      this.message = 'Token invalido.';
      return;
    }
    this.sdk.registratClientes(this.token, this.clientData).subscribe({
      next: (response) => {
        this.message = response.message;
        this.clientData = { nombre: '', email: '' };
        this.getClientes();
      },
      error: (error) => {
        console.error('Error al registrar el cliente:', error);
        this.message = 'Error al registrar el cliente.';
      },
    });
  }

  deleteCliente(id: number) {
    this.sdk.deleteCliente(id).subscribe({
      next: (response: any) => {
        console.log('Se elimino el cliente', response);
        this.getClientes();
      },
      error: (err: any) => {
        console.log('Error al obtener los clientes', err);
      },
    });
  }
}
