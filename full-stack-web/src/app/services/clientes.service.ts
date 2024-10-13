import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Clientes from '../interfaces/cliente';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private readonly url = `${environment.baseUrl}/clientes`;
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get(this.url);
  }

  post(data: Clientes): Observable<Clientes> {
    return this.http.post<Clientes>(this.url, data);
  }
  update(id: number, data: Clientes): Observable<Clientes> {
    return this.http.put<Clientes>(`${this.url}/${id}`, data);
  }
  
  delete(id: number): Observable<void> {
    // Cambia el tipo de retorno y acepta un id
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
