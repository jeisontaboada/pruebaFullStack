import { Component, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,RouterLinkActive,MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {


  isMenuVisible = false;
  windowWidth = window.innerWidth;

  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
  }
}
