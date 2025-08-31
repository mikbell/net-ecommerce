import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { BusyTestComponent } from '../../shared/components/busy-test/busy-test.component';

interface TechStackItem {
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  version?: string;
}

interface ProjectFeature {
  title: string;
  description: string;
  icon: string;
  implemented: boolean;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    BusyTestComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  
  projectInfo = {
    title: 'Portfolio E-commerce Project',
    description: 'Questo è un progetto di portfolio sviluppato per dimostrare competenze di sviluppo full-stack. Non è un vero e-commerce e non elabora transazioni reali.',
    purpose: 'Il progetto è stato creato per mostrare l\'implementazione di un\'applicazione moderna con tecnologie all\'avanguardia, best practices di sviluppo e architettura scalabile.',
    githubUrl: 'https://github.com/username/ecommerce-project', // Sostituire con URL reale
    linkedinUrl: 'https://linkedin.com/in/developer', // Sostituire con URL reale
    features: [
      'Sistema di autenticazione (in sviluppo)',
      'Gestione prodotti con CRUD completo',
      'Carrello shopping (in sviluppo)',
      'Sistema di ricerca e filtri avanzati',
      'Design responsive e moderno',
      'Error handling centralizzato',
      'Architettura scalabile e modulare'
    ]
  };

  techStack: TechStackItem[] = [
    // Frontend
    {
      name: 'Angular',
      category: 'Frontend',
      description: 'Framework per applicazioni web moderne e scalabili',
      icon: 'code',
      color: '#DD0031',
      version: '18+'
    },
    {
      name: 'TypeScript',
      category: 'Frontend',
      description: 'Linguaggio tipizzato per sviluppo JavaScript robusto',
      icon: 'integration_instructions',
      color: '#3178C6',
      version: '5.5+'
    },
    {
      name: 'Angular Material',
      category: 'Frontend',
      description: 'UI Component library basata su Material Design',
      icon: 'palette',
      color: '#FF6F00',
      version: '18+'
    },
    {
      name: 'TailwindCSS',
      category: 'Frontend',
      description: 'Framework CSS utility-first per styling rapido',
      icon: 'brush',
      color: '#06B6D4',
      version: '3.4+'
    },
    {
      name: 'RxJS',
      category: 'Frontend',
      description: 'Libreria per programmazione reattiva con Observable',
      icon: 'sync',
      color: '#B7178C',
      version: '7.8+'
    },
    {
      name: 'SCSS/Sass',
      category: 'Frontend',
      description: 'Preprocessore CSS per styling avanzato',
      icon: 'style',
      color: '#CC6699',
      version: 'Latest'
    },

    // Backend
    {
      name: '.NET 8',
      category: 'Backend',
      description: 'Framework Microsoft per API REST moderne e performanti',
      icon: 'dns',
      color: '#512BD4',
      version: '8.0'
    },
    {
      name: 'C#',
      category: 'Backend',
      description: 'Linguaggio di programmazione orientato agli oggetti',
      icon: 'code',
      color: '#239120',
      version: '12+'
    },
    {
      name: 'Entity Framework',
      category: 'Backend',
      description: 'ORM per accesso ai dati con Code First approach',
      icon: 'storage',
      color: '#5C2D91',
      version: 'Core 8+'
    },
    {
      name: 'AutoMapper',
      category: 'Backend',
      description: 'Libreria per mapping automatico tra oggetti DTO',
      icon: 'transform',
      color: '#FF6B35',
      version: 'Latest'
    },
    {
      name: 'Swagger/OpenAPI',
      category: 'Backend',
      description: 'Documentazione interattiva delle API REST',
      icon: 'api',
      color: '#85EA2D',
      version: 'Latest'
    },

    // Database & Tools
    {
      name: 'SQL Server',
      category: 'Database',
      description: 'Database relazionale enterprise per produzione',
      icon: 'database',
      color: '#CC2927',
      version: '2022+'
    },
    {
      name: 'Git',
      category: 'DevTools',
      description: 'Sistema di controllo versione distribuito',
      icon: 'source',
      color: '#F05032',
      version: 'Latest'
    },
    {
      name: 'Visual Studio Code',
      category: 'DevTools',
      description: 'IDE leggero e potente per sviluppo web',
      icon: 'edit',
      color: '#007ACC',
      version: 'Latest'
    },
    {
      name: 'Postman',
      category: 'DevTools',
      description: 'Tool per testing e documentazione API',
      icon: 'http',
      color: '#FF6C37',
      version: 'Latest'
    }
  ];

  implementedFeatures: ProjectFeature[] = [
    {
      title: 'Homepage Moderna',
      description: 'Hero section accattivante con prodotti in evidenza',
      icon: 'home',
      implemented: true
    },
    {
      title: 'Catalogo Prodotti',
      description: 'Lista prodotti con ricerca, filtri e paginazione',
      icon: 'inventory',
      implemented: true
    },
    {
      title: 'Dettaglio Prodotto',
      description: 'Pagina dettagliata con immagini e specifiche',
      icon: 'info',
      implemented: true
    },
    {
      title: 'Error Handling',
      description: 'Sistema centralizzato per gestione errori',
      icon: 'error_outline',
      implemented: true
    },
    {
      title: 'Design Responsive',
      description: 'Ottimizzato per mobile, tablet e desktop',
      icon: 'devices',
      implemented: true
    },
    {
      title: 'API REST Complete',
      description: 'Backend con CRUD operations e validazione',
      icon: 'api',
      implemented: true
    },
    {
      title: 'Autenticazione',
      description: 'Sistema login/register con JWT tokens',
      icon: 'lock',
      implemented: false
    },
    {
      title: 'Carrello Shopping',
      description: 'Gestione carrello con localStorage',
      icon: 'shopping_cart',
      implemented: false
    },
    {
      title: 'Checkout & Pagamenti',
      description: 'Processo di acquisto (simulato)',
      icon: 'payment',
      implemented: false
    },
    {
      title: 'Dashboard Admin',
      description: 'Pannello amministrativo per gestione prodotti',
      icon: 'admin_panel_settings',
      implemented: false
    }
  ];

  getImplementedCount(): number {
    return this.implementedFeatures.filter(f => f.implemented).length;
  }

  getTotalFeaturesCount(): number {
    return this.implementedFeatures.length;
  }

  getCompletionPercentage(): number {
    return Math.round((this.getImplementedCount() / this.getTotalFeaturesCount()) * 100);
  }

  getCategoryTechs(category: string): TechStackItem[] {
    return this.techStack.filter(tech => tech.category === category);
  }

  getCategories(): string[] {
    return Array.from(new Set(this.techStack.map(tech => tech.category)));
  }
}
