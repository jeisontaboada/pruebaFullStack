import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {  MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatIcon,CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() text:string | undefined
  @Input() icon:string | undefined
  @Input() bgClass: string = '';

}
