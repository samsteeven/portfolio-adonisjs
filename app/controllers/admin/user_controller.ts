import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { UserService } from '#services/user_service'
import { createUserSchema, updateUserSchema } from '#validators/user_validator'
import FileUploadService from '#services/file_upload/file_upload_service'
import BouncerUserService from '#services/bouncer/bouncer_user_service'

@inject()
export default class UserController {
  constructor(
    private userService: UserService,
    private bouncerUserService: BouncerUserService
  ) {}

  /**
   * Affiche la liste des utilisateurs avec pagination et filtres
   */
  async index({ inertia }: HttpContext) {
    const data = await this.userService.getUsers()
    const users = data.map((user) => {
      return user.serialize({
        fields: {
          pick: ['id', 'username', 'role', 'isActive', 'provider', 'createdAt'],
        },
      })
    })
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
  async store({ request, response, session, bouncer, logger }: HttpContext) {
    const authResult = await this.bouncerUserService.canStoreUser(bouncer)
    if (!authResult.authorized) {
      return this.bouncerUserService.handleUnauthorized(response, session, authResult.error)
    }

    const userData = await request.validateUsing(createUserSchema)
    const photo = userData.subInfo?.photoPath
    const cv = userData.subInfo?.cv
    let photoUrl: string | undefined
    let cvUrl: string | undefined

    if (photo) {
      try {
        photoUrl = await FileUploadService.uploadProfilePhoto(photo)
      } catch (error) {
        session.flash('error', error.message)
        return response.redirect().back()
      }
    }

    if (cv) {
      try {
        cvUrl = await FileUploadService.uploadCV(cv, userData.username)
      } catch (error) {
        session.flash('error', error.message)
        return response.redirect().back()
      }
    }

    try {
      await this.userService.createUser({
        ...userData,
        subInfo: {
          ...userData.subInfo,
          photoPath: photoUrl,
          cv: cvUrl,
        },
      })

      session.flash('success', 'Utilisateur créé avec succès')
      return response.redirect().back()
    } catch (error) {
      // Nettoyer les fichiers uploadés en cas d'erreur
      if (photoUrl) {
        const fileName = photoUrl.split('/').pop()
        if (fileName) await FileUploadService.deleteFile(fileName)
      }

      if (cvUrl) {
        const fileName = cvUrl.split('/').pop()
        if (fileName) await FileUploadService.deleteFile(fileName)
      }

      logger.error(error)
      session.flash('error', "Erreur lors de la création de l'utilisateur" + error.message)
      return response.redirect().back()
    }
  }

  /**
   * Affiche un utilisateur spécifique
   */
  async show({ session, bouncer, params, response }: HttpContext) {
    const authResult = await this.bouncerUserService.canShowUser(bouncer, params.id)
    if (!authResult.authorized) {
      return this.bouncerUserService.handleUnauthorized(response, session, authResult.error)
    }
    const user = await this.userService.getUserById(params.id)
    return response.json(user)
  }

  /**
   * Affiche le formulaire d'édition d'utilisateur
   */
  async edit({ inertia, params, bouncer, response, session }: HttpContext) {
    const authResult = await this.bouncerUserService.canUpdateUser(bouncer, params.id)
    if (!authResult.authorized) {
      return this.bouncerUserService.handleUnauthorized(response, session, authResult.error)
    }
    const user = await this.userService.getUserById(params.id)
    return inertia.render('admin/users/edit', { user })
  }

  /**
   *Met à jour un utilisateur
   */
  async update({ request, response, params, session, bouncer, auth, logger }: HttpContext) {
    const authResult = await this.bouncerUserService.canUpdateUser(bouncer, params.id)
    if (!authResult.authorized) {
      return this.bouncerUserService.handleUnauthorized(response, session, authResult.error)
    }

    const userData = await request.validateUsing(updateUserSchema, { meta: { userId: params.id } })
    const { photoPath: photo, cv, ...otherSubInfo } = userData.subInfo || {}

    try {
      let photoUrl: string | undefined
      let cvUrl: string | undefined

      // Gérer le remplacement de photo si nécessaire
      if (photo) {
        const existingUser = await this.userService.findUser(params.id)
        const oldPhotoPath = existingUser?.subInfo?.photoPath

        photoUrl = await FileUploadService.replaceProfilePhoto(photo, oldPhotoPath)
      }

      // Gérer le remplacement du CV si nécessaire
      if (cv) {
        const existingUser = await this.userService.findUser(params.id)
        const oldCVPath = existingUser?.subInfo?.cv

        cvUrl = await FileUploadService.replaceCV(cv, oldCVPath, existingUser.username)
      }

      // Mettre àjour l'utilisateur
      await this.userService.updateUser(
        params.id,
        {
          ...userData,
          subInfo: {
            ...otherSubInfo,
            ...(photoUrl && { photoPath: photoUrl }), // Seulement si nouvelle photo
            ...(cvUrl && { cv: cvUrl }), // Seulement si nouveau CV
          },
        },
        auth.user
      )
      session.flash('success', 'Utilisateur mis à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      logger.error(error)
      session.flash('error', 'Erreur lors de la mise a jour ducompte')
      return response.redirect().back()
    }
  }

  /**
   * Supprime un utilisateur
   */
  async destroy({ response, params, session, bouncer, logger }: HttpContext) {
    const authResult = await this.bouncerUserService.canDestroyUser(bouncer, params.id)
    if (!authResult.authorized) {
      return this.bouncerUserService.handleUnauthorized(response, session, authResult.error)
    }

    try {
      await this.userService.deleteUser(params.id)
      session.flash('success', 'Utilisateur supprimé avec succès')
      return response.redirect().back()
    } catch (error) {
      logger.error(error)
      session.flash('error', `Erreur lors de la suppression de l'utilisateur ${error.message}`)
      return response.redirect().back()
    }
  }

  /**
   * Active/désactive un utilisateur
   */
  async toggleStatus({ response, params, session, logger }: HttpContext) {
    try {
      await this.userService.toggleUserStatus(params.id)
      return response.redirect().back()
    } catch (error) {
      logger.error(error)
      session.flash('error', `Erreur lors de la mise à jour du statut ${error.message}`)
      return response.redirect().back()
    }
  }
}
