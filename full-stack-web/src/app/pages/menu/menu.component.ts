import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent  {
 

}
