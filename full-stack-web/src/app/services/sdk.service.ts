import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SdkService {
  private seguridadyUrl = 'http://localhost:3001';
  private clienteUrl = 'http://localhost:3002';

  constructor(private http: HttpClient) {}

  getToken(): Observable<{ token: string }> {
    return this.http.get<{ token: string }>(`${this.seguridadyUrl}/generar-token`);
  }
  getClientes(){
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
