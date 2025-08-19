import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { UserService } from '#services/user_service'
import { UserRole } from '#enums/user_role'
import { createUserSchema, updateUserSchema } from '#validators/user_validator'

@inject()
export default class UserController {
  constructor(private userService: UserService) {}

  /**
   * Affiche la liste des utilisateurs avec pagination et filtres
   */
  async index({ inertia, request }: HttpContext) {
    const search = request.input('search', '')
    const role = request.input('role') as UserRole

    const users = await this.userService.getUsers({ search, role })

    return inertia.render('admin/users', { users })
  }

  /**
   * Affiche le formulaire de création d'utilisateur
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('admin/users/create')
  }

  /**
   * Enregistre un nouvel utilisateur
   */
  async store({ request, response, session }: HttpContext) {
    const userData = await request.validateUsing(createUserSchema)
    try {
      await this.userService.createUser(userData)

      session.flash('success', 'Utilisateur créé avec succès')
      return response.redirect().toRoute('admin.users')
    } catch (error) {
      session.flash('error', "Erreur lors de la création de l'utilisateur")
      return response.redirect().back()
    }
  }

  /**
   * Affiche un utilisateur spécifique
   */
  async show({ inertia, params }: HttpContext) {
    const user = await this.userService.getUserById(params.id)
    return inertia.render('admin/users/show', { user })
  }

  /**
   * Affiche le formulaire d'édition d'utilisateur
   */
  async edit({ inertia, params }: HttpContext) {
    const user = await this.userService.getUserById(params.id)
    return inertia.render('admin/users/edit', { user })
  }

  /**
   * Met à jour un utilisateur
   */
  async update({ request, response, params, session }: HttpContext) {
    const userData = await request.validateUsing(updateUserSchema)
    try {
      await this.userService.updateUser(params.id, userData)

      session.flash('success', 'Utilisateur mis à jour avec succès')
      return response.redirect().toRoute('admin.users')
    } catch (error) {
      session.flash('error', "Erreur lors de la mise à jour de l'utilisateur")
      return response.redirect().back()
    }
  }

  /**
   * Supprime un utilisateur
   */
  async destroy({ response, params, session }: HttpContext) {
    try {
      await this.userService.deleteUser(params.id)

      session.flash('success', 'Utilisateur supprimé avec succès')
      return response.redirect().toRoute('admin.users')
    } catch (error) {
      session.flash('error', "Erreur lors de la suppression de l'utilisateur")
      return response.redirect().back()
    }
  }

  /**
   * Active/désactive un utilisateur
   */
  async toggleStatus({ response, params, session }: HttpContext) {
    try {
      await this.userService.toggleUserStatus(params.id)

      session.flash('success', "Statut de l'utilisateur mis à jour")
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'Erreur lors de la mise à jour du statut')
      return response.redirect().back()
    }
  }
}
