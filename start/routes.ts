/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { limitter } from '#start/limiter'
const SkillsController = () => import('#controllers/skill_controller')
const TechnologyController = () => import('#controllers/technology_controller')
const UserController = () => import('#controllers/user_controller')

// Routes publiques avec silent_auth pour avoir accès à l'utilisateur connecté
router.on('/').renderInertia('home').as('home')

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
    router
      .group(() => {
        router.get('/', '#controllers/project_controller.index').as('admin.projects')
        router.get('/create', '#controllers/project_controller.create').as('admin.projects.create')
        router.post('/', '#controllers/project_controller.store').as('admin.projects.store')
        router.get('/:id', '#controllers/project_controller.show').as('admin.projects.show')
        router.get('/:id/edit', '#controllers/project_controller.edit').as('admin.projects.edit')
        router.put('/:id', '#controllers/project_controller.update').as('admin.projects.update')
        router
          .delete('/:id', '#controllers/project_controller.destroy')
          .as('admin.projects.destroy')
        router
          .patch('/:id/toggle-status', '#controllers/project_controller.toggleStatus')
          .as('admin.projects.toggle-status')
      })
      .prefix('/admin/projects')
      .use(middleware.auth())

    // ===== CRUD CONTACTS =====
    router
      .group(() => {
        router.get('/', '#controllers/contact_controller.index').as('admin.contacts')
        router.get('/stats', '#controllers/contact_controller.stats').as('admin.contacts.stats')
        router.get('/:id', '#controllers/contact_controller.show').as('admin.contacts.show')
        router
          .patch('/:id/status', '#controllers/contact_controller.updateStatus')
          .as('admin.contacts.update-status')
        router
          .patch('/:id/mark-read', '#controllers/contact_controller.markAsRead')
          .as('admin.contacts.mark-read')
        router
          .patch('/:id/mark-replied', '#controllers/contact_controller.markAsReplied')
          .as('admin.contacts.mark-replied')
        router
          .delete('/:id', '#controllers/contact_controller.destroy')
          .as('admin.contacts.destroy')
        router
          .delete('/batch', '#controllers/contact_controller.destroyMultiple')
          .as('admin.contacts.destroy-multiple')
        router.get('/export', '#controllers/contact_controller.export').as('admin.contacts.export')
      })
      .prefix('/admin/contacts')
      .use(middleware.auth())
  })
  .prefix('/admin')
  .middleware([middleware.auth(), middleware.isActive()])
