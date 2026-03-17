import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// In your theme service
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<string>('dark');
  public currentTheme$ = this.currentThemeSubject.asObservable();
  private readonly linkId = 'dx-theme';

  constructor() {
    this.loadInitialTheme();
  }

  public loadInitialTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    // Validate the saved theme
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('light'); // Default fallback
    }
  }

    private isValidTheme(theme: string): theme is 'light' | 'dark' {
    return theme === 'light' || theme === 'dark';
  }
  switchTheme(isLight: boolean): void {
    const theme = isLight ? 'light' : 'dark';
    this.applyTheme(theme);
  }


  private applyTheme(theme: 'light' | 'dark'): void {
    const link = document.getElementById(this.linkId) as HTMLLinkElement;
    
    if (theme === 'dark') {
      link.href = 'assets/dx-themes/dx.material.orange.dark.compact.css';
    } else {
      link.href = 'assets/dx-themes/dx.material.orange.light.compact.css';
    }
    localStorage.setItem('theme', theme);
    

    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }


  setTheme(theme: 'light' | 'dark'): void {
    // Remove existing theme link
    const existingLink = document.getElementById('dx-theme');
    if (existingLink) {
      existingLink.remove();
    }

    // Create new theme link
    const link = document.createElement('link');
    link.id = 'dx-theme';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    
    if (theme === 'dark') {
      link.href = 'assets/dx-themes/dx.material.orange.dark.compact.css';
    } else {
      link.href = 'assets/dx-themes/dx.material.orange.light.compact.css';
    }
    
    document.head.appendChild(link);
    document.body.className = theme === 'dark' ? 'dx-viewport dark-theme' : 'dx-viewport light-theme';

    localStorage.setItem('theme', theme);
    
    this.currentThemeSubject.next(theme);
  }

  toggleTheme(): void {
    const currentTheme = this.currentThemeSubject.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}
