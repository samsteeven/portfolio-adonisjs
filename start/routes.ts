import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { limitter } from '#start/limiter'
import { HttpContext } from '@adonisjs/core/http'
const FaqController = () => import('#controllers/admin/admin_faq_controller')
const AdminNewsletterController = () => import('#controllers/admin/admin_newsletters_controller')
const ContactRequestsController = () => import('#controllers/contact_requests_controller')
const ServicesController = () => import('#controllers/services_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const TagsController = () => import('#controllers/admin/tags_controller')
const BlogPostsController = () => import('#controllers/admin/blog_posts_controller')
const CommentaireController = () => import('#controllers/commentaire_controller')
const ProjectsController = () => import('#controllers/admin/project_controller')
const SkillsController = () => import('#controllers/admin/skill_controller')
const TechnologyController = () => import('#controllers/admin/technology_controller')
const UserController = () => import('#controllers/admin/user_controller')
const AuthController = () => import('#controllers/auth_controller')
const ContactRequestController = () => import('#controllers/contact_requests_controller')
const NewsletterController = () => import('#controllers/newsletters_controller')

// Routes publiques avec silent_auth pour avoir accès à l'utilisateur connecté
router.get('/', [DashboardController, 'portfolio']).as('home')
router.get('/whoami', async ({ request, response }: HttpContext) => {
  const ip = request.qs().ip
  const countryRes = await fetch(`http://ip-api.com/json/${ip}`)
  const countryData = (await countryRes.json()) as {
    countryCode: string
  }

  return response.json({
    countryCode: countryData.countryCode,
  })
})
router.get('/projects/:slug', [DashboardController, 'projectShow'])

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
  .post('/guestbook/guest', [CommentaireController, 'storeGuest'])
  .middleware(middleware.guest())

// API pour les statistiques géographiques (public, pour affichage sur la page)
router.get('/guestbook/stats/geo', [CommentaireController, 'getGeoStats'])
router
  .post('/auth/guestbook/logout', [AuthController, 'guestbookLogout'])
  .middleware(middleware.auth({ guards: ['guestbook'] }))

// Routes blog publiques
router.get('/blog', '#controllers/blog_controller.index')
router.get('/blog/:slug', '#controllers/blog_controller.show').where('slug', /^[a-z0-9\-]+$/)

// Newsletter
router.post('/newsletter/subscribe', [NewsletterController, 'subscribe']).use(limitter)
router.get('/newsletter/unsubscribe/:token', [NewsletterController, 'unsubscribe']).use(limitter)

router.get('/services', [ServicesController, 'publicIndex'])
// // Page détail d'un service (par slug)
// router.get('/services/:slug', [ServicesController, 'show'])

// Page du formulaire de contact
router.get('/contact', [ContactRequestController, 'showForm'])

// Soumettre une demande de contact
router.post('/contact', [ContactRequestController, 'store'])

router.get('/misc/faq', [FaqController, 'indexPublic'])

// Routes d'authentification
router
  .group(() => {
    router.get('/auth/login', [AuthController, 'showLogin'])
    router.post('/auth/login', [AuthController, 'login']).use(limitter)
  })
  .middleware(middleware.guest())

// Routes protégées
router
  .group(() => {
    router.post('/auth/logout', [AuthController, 'logout'])
    router.get('/dashboard', [DashboardController, 'index']).as('dashboard')
    // API pour refresh en temps réel
    router
      .get('/dashboard/api', [DashboardController, 'api'])
      .as('admin.dashboard.api')
      .middleware(middleware.isAdmin())
    // Endpoint pour forcer le refresh du cache
    router
      .get('/dashboard/stats/refresh', [DashboardController, 'refresh'])
      .as('admin.dashboard.refresh')
      .middleware(middleware.isAdmin())

    router.get('/settings/profile', [DashboardController, 'profile']).as('admin.profile')

    // ===== UTILISATEURS =====
    router.resource('users', UserController)
    router
      .patch('users/:id/toggle-status', [UserController, 'toggleStatus'])
      .middleware(middleware.authorizeUser('toggleStatus'))

    // ===== TECHNOLOGIES =====
    router.resource('technologies', TechnologyController)

    // ===== CRUD COMPÉTENCES =====
    router.resource('skills', SkillsController)
    router.patch('skills/:id/toggle-status', [SkillsController, 'toggleStatus'])

    // ===== CRUD PROJETS =====
    router.resource('projects', ProjectsController)
    router.patch('projects/:id/toggle-status', [ProjectsController, 'toggleStatus'])
    // Nouvelles routes pour la gestion des images
    router.patch('projects/:id/reorder-images', [ProjectsController, 'reorderImages'])
    router.patch('projects/:id/set-primary-image', [ProjectsController, 'setPrimaryImage'])

    // ===== COMMENTAIRES =====
    router.resource('comments', CommentaireController)
    router.patch('/comments/:id/reaction', [CommentaireController, 'addReaction'])

    // ===== Blog post =====
    router.resource('blog', BlogPostsController)
    router.patch('/blog/:id/toggle-status', [BlogPostsController, 'toggleStatus'])
    // ===== Tags =====
    router.resource('tags', TagsController).except(['show'])

    // ===== Newsletter =====
    router.get('/newsletter/subscribers', [AdminNewsletterController, 'index'])
    router.delete('/newsletter/:id', [AdminNewsletterController, 'destroy'])
    router.delete('/newsletter/bulk', [AdminNewsletterController, 'bulkDestroy'])
    router.patch('/newsletter/:id', [AdminNewsletterController, 'toggleStatus'])

    // ==== Services ===
    router.resource('services', ServicesController)
    router.patch('/services/:id/toggle-status', [ServicesController, 'toggleStatus'])
    // Dupliquer un service
    router.post('/services/:id/duplicate', [ServicesController, 'duplicate'])
    // Réorganiser l'ordre d'affichage des services
    router.patch('/reorder/services', [ServicesController, 'reorder'])

    // ==== DEMANDES DE CONTACT ====
    router.resource('contact-requests', ContactRequestsController).except(['update'])
    router.patch('/contact-requests/:id/status', [ContactRequestsController, 'updateStatus'])
    router.post('/contact-requests/:id/reply', [ContactRequestsController, 'reply'])
    // Actions en lot
    router.patch('/contact-requests/bulk-mark-as-read', [
      ContactRequestsController,
      'bulkMarkAsRead',
    ])

    // Routes admin FAQ
    router.resource('faqs', FaqController)
  })
  .prefix('/admin')
  .middleware([middleware.auth({ guards: ['web'] }), middleware.isActive()])
