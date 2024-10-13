import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly url = `${environment.baseUrl}/auth`;
  private readonly http = inject(HttpClient);
  
  login(usuario: string, password: string) {
    return this.http.post(`${this.url}/login`, { usuario, contrasenia: password });
  }
}
