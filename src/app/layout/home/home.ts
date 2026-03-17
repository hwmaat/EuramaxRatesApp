import { Component, OnInit } from '@angular/core';

//import { ThemeService } from '@app/services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  ngOnInit(): void {

  }

}
