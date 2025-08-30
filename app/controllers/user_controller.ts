import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { UserService } from '#services/user_service'
import { UserRole } from '#enums/user_role'
import { createUserSchema, updateUserSchema } from '#validators/user_validator'
import FileUploadService from '#services/file_upload_service'
import BouncerUserService from '#services/bouncer_user_service'

@inject()
export default class UserController {
  constructor(
    private userService: UserService,
    private bouncerUserService: BouncerUserService
  ) {}

  /**
   * Affiche la liste des utilisateurs avec pagination et filtres
   */
  async index({ inertia, request }: HttpContext) {
    const search = request.input('search', '')
    const role = request.input('role') as UserRole

    const users = await this.userService.getUsers({ search, role })

    return inertia.render('admin/users/users', { users })
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
  async store({ request, response, session, bouncer }: HttpContext) {
    // Vérification d'autorisation simplifiée
    const authResult = await this.bouncerUserService.canStoreUser(bouncer)
    if (!authResult.authorized) {
      return this.bouncerUserService.handleUnauthorized(response, session, authResult.error)
    }

    const userData = await request.validateUsing(createUserSchema)
    const photo = userData.subInfo?.photoPath
    let photoUrl: string | undefined

    if (photo?.isValid) {
      try {
        photoUrl = await FileUploadService.uploadProfilePhoto(photo)
      } catch (error) {
        session.flash('error', error.message)
        return response.redirect().back()
      }
    }

    try {
      await this.userService.createUser({
        ...userData,
        subInfo: { ...userData.subInfo, photoPath: photoUrl },
      })

      session.flash('success', 'Utilisateur créé avec succès')
      return response.redirect().back()
    } catch (error) {
      if (photoUrl) {
        const fileName = photoUrl.split('/').pop()
        if (fileName) await FileUploadService.deleteFile(fileName)
      }
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
  async update({ request, response, params, session, bouncer }: HttpContext) {
    // Vérification d'autorisation simplifiée
    const authResult = await this.bouncerUserService.canUpdateUser(bouncer, params.id)
    if (!authResult.authorized) {
      return this.bouncerUserService.handleUnauthorized(response, session, authResult.error)
    }

    const userData = await request.validateUsing(updateUserSchema, { meta: { userId: params.id } })
    const { photoPath: photo, ...otherSubInfo } = userData.subInfo || {}

    try {
      let photoUrl: string | undefined

      // Gérer le remplacement de photo si nécessaire
      if (photo) {
        const existingUser = await this.userService.findUser(params.id)
        const oldPhotoPath = existingUser?.subInfo?.photoPath

        photoUrl = await FileUploadService.replaceProfilePhoto(photo, oldPhotoPath)
      }

      // Mettre à jour l'utilisateur
      await this.userService.updateUser(params.id, {
        ...userData,
        subInfo: {
          ...otherSubInfo,
          ...(photoUrl && { photoPath: photoUrl }), // Seulement si nouvelle photo
        },
      })

      session.flash('success', 'Utilisateur mis à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  /**
   * Supprime un utilisateur
   */
  async destroy({ response, params, session, bouncer }: HttpContext) {
    // Vérification d'autorisation simplifiée
    const authResult = await this.bouncerUserService.canDestroyUser(bouncer, params.id)
    if (!authResult.authorized) {
      return this.bouncerUserService.handleUnauthorized(response, session, authResult.error)
    }

    try {
      await this.userService.deleteUser(params.id)

      session.flash('success', 'Utilisateur supprimé avec succès')
      return response.redirect().back()
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
