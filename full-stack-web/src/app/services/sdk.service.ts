import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SdkService {
  private seguridadUrl = `${environment.seguridadUrl}`;
  private clienteUrl = `${environment.clienteUrl}`;

  constructor(private http: HttpClient) {}

  getToken(): Observable<{ token: string }> {
    return this.http.get<{ token: string }>(
      `${this.seguridadUrl}/generar-token`
    );
  }
  getClientes() {
    return this.http.get(`${this.clienteUrl}/clientes`);
  }

  registratClientes(token: string, clientData: any): Observable<any> {
    const data = { token, clientData };
    return this.http.post(`${this.clienteUrl}/registrar-cliente`, data);
  }
  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.clienteUrl}/clientes/${id}`);
  }
}
