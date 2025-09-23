import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Service from '#models/service'

export default class ServiceSeeder extends BaseSeeder {
  async run() {
    await Service.createMany([
      {
        title: 'Développement Web',
        slug: 'developpement-web',
        description:
          "Création de sites web modernes, responsives et performants avec les dernières technologies (React, Vue.js, Node.js). De la conception à la mise en ligne, je m'occupe de tous les aspects techniques de votre projet web.",
        image: '/images/services/web-dev.jpg',
        price: null, // Prix sur devis
        isActive: true,
        displayOrder: 1,
      },
      {
        title: 'Applications Mobile',
        slug: 'applications-mobile',
        description:
          "Développement d'applications mobiles natives et cross-platform pour iOS et Android. Interface utilisateur intuitive, performances optimales et intégration complète avec vos services existants.",
        price: null,
        isActive: true,
        displayOrder: 2,
      },
      {
        title: 'Consulting Technique',
        slug: 'consulting-technique',
        description:
          'Audit de votre architecture existante, conseils en choix technologiques et accompagnement stratégique pour vos projets de transformation digitale. Expertise technique et vision business combinées.',
        image: '/images/services/consulting.jpg',
        price: 150, // Tarif horaire
        isActive: true,
        displayOrder: 3,
      },
      {
        title: 'Formation & Mentorat',
        slug: 'formation-mentorat',
        description:
          'Formation personnalisée en développement web et mobile. Sessions individuelles ou en équipe pour monter en compétences sur les technologies modernes. Suivi personnalisé et projets pratiques.',
        image: '/images/services/formation.jpg',
        price: 80, // Tarif horaire
        isActive: true,
        displayOrder: 4,
      },
      {
        title: 'Maintenance & Support',
        slug: 'maintenance-support',
        description:
          'Maintenance préventive et corrective de vos applications web et mobile. Support technique, mises à jour de sécurité et évolutions fonctionnelles. Disponibilité et réactivité garanties.',
        price: 100, // Tarif mensuel forfaitaire disponible
        isActive: true,
        displayOrder: 5,
      },
      {
        title: 'API & Intégrations',
        slug: 'api-integrations',
        description:
          "Conception et développement d'APIs REST et GraphQL. Intégration avec des services tiers, automatisation de processus et synchronisation de données entre vos différents systèmes.",
        price: null,
        isActive: true,
        displayOrder: 6,
      },
      {
        title: 'Optimisation Performance',
        slug: 'optimisation-performance',
        description:
          'Audit et optimisation des performances de vos applications web et mobile. Amélioration des temps de chargement, optimisation SEO et expérience utilisateur. Monitoring et suivi des KPIs.',
        image: null, // Pas d'image pour ce service
        price: null,
        isActive: false, // Service temporairement désactivé
        displayOrder: 7,
      },
    ])

    console.log('✅ Services créés avec succès')
  }
}
