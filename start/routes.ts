import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { limitter } from '#start/limiter'
import CommentairesController from '#controllers/commentaire_controller'
const DashboardController = () => import('#controllers/dashboard_controller')
const TagsController = () => import('#controllers/tags_controller')
const BlogPostsController = () => import('#controllers/blog_posts_controller')
const CommentaireController = () => import('#controllers/commentaire_controller')
const ProjectsController = () => import('#controllers/project_controller')
const SkillsController = () => import('#controllers/skill_controller')
const TechnologyController = () => import('#controllers/technology_controller')
const UserController = () => import('#controllers/user_controller')

// Routes publiques avec silent_auth pour avoir accès à l'utilisateur connecté
router.get('/', [DashboardController, 'portfolio']).as('home')
router.get('/projects/:slug', '#controllers/dashboard_controller.projectShow')

// Routes pour la guestbook
router.get('/guestbook', [CommentaireController, 'indexGuestBook'])
router
  .group(() => {
    router
      .get('/oauth/:provider/redirect', '#controllers/allies_controller.redirect')
      .where('provider', /github|google/)
    router
      .get('/oauth/:provider/callback', '#controllers/allies_controller.callback')
      .where('provider', /github|google/)
  })
  .middleware(middleware.guest())
// Soumission de commentaire pour visiteur authentifié
router
  .post('/guestbook/authenticated', [CommentaireController, 'storeAuthenticated'])
  .middleware([middleware.auth({ guards: ['web', 'guestbook'] })])

// Soumission de commentaire pour visiteur invité
router
  .post('/guestbook/guest', [CommentairesController, 'storeGuest'])
  .middleware(middleware.guest())

// API pour les statistiques géographiques (public, pour affichage sur la page)
router.get('/guestbook/stats/geo', [CommentairesController, 'getGeoStats'])
router
  .post('/auth/guestbook/logout', '#controllers/auth_controller.guestbookLogout')
  .middleware(middleware.auth({ guards: ['guestbook'] }))

// Routes blog publiques
router.get('/blog', '#controllers/blog_controller.index')
router.get('/blog/:slug', '#controllers/blog_controller.show').where('slug', /^[a-z0-9\-]+$/)

// Newsletter
router.post('/newsletter/subscribe', '#controllers/newsletters_controller.subscribe').use(limitter)
router
  .get('/newsletter/unsubscribe/:token', '#controllers/newsletters_controller.unsubscribe')
  .use(limitter)

// Routes d'authentification
router
  .group(() => {
    router.get('/auth/login', '#controllers/auth_controller.showLogin')
    router.post('/auth/login', '#controllers/auth_controller.login').use(limitter)
  })
  .middleware(middleware.guest())

// Routes protégées
router
  .group(() => {
    router.post('/auth/logout', '#controllers/auth_controller.logout')
    router.get('/dashboard', '#controllers/dashboard_controller.index').as('dashboard')
    router.get('/settings/profile', '#controllers/admin_controller.profile').as('admin.profile')

    // ===== UTILISATEURS =====
    router.resource('users', UserController)
    router
      .patch('users/:id/toggle-status', '#controllers/user_controller.toggleStatus')
      .middleware(middleware.authorizeUser('toggleStatus'))

    // ===== TECHNOLOGIES =====
    router.resource('technologies', TechnologyController)

    // ===== CRUD COMPÉTENCES =====
    router.resource('skills', SkillsController)
    router.patch('skills/:id/toggle-status', '#controllers/skill_controller.toggleStatus')

    // ===== CRUD PROJETS =====
    router.resource('projects', ProjectsController)
    router.patch('projects/:id/toggle-status', '#controllers/project_controller.toggleStatus')
    // Nouvelles routes pour la gestion des images
    router.patch('projects/:id/reorder-images', '#controllers/projects_controller.reorderImages')
    router.patch(
      'projects/:id/set-primary-image',
      '#controllers/projects_controller.setPrimaryImage'
    )

    // ===== COMMENTAIRES =====
    router.resource('comments', CommentaireController)
    router.patch('/comments/:id/reaction', [CommentaireController, 'addReaction'])

    // ===== Blog post =====
    router.resource('blog', BlogPostsController)
    router.patch('/blog/:id/toggle-status', [BlogPostsController, 'toggleStatus'])
    // ===== Tags =====
    router.resource('tags', TagsController).except(['show'])

    // ===== Newsletter =====
    router.get('/newsletter/subscribers', '#controllers/admin_newsletters_controller.index')
    router.delete('/newsletter/:id', '#controllers/admin_newsletters_controller.destroy')
    router.delete('/newsletter/bulk', '#controllers/admin_newsletters_controller.bulkDestroy')
    router.patch('/newsletter/:id', '#controllers/admin_newsletters_controller.toggleStatus')
  })
  .prefix('/admin')
  .middleware([middleware.auth({ guards: ['web'] }), middleware.isActive()])
