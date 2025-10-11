import User from '#models/user'
import { UserRole } from '#enums/user_role'
import { CreateUserDTO, UpdateUserDTO } from '#validators/user_validator'
import db from '@adonisjs/lucid/services/db'
import FileUploadService from '#services/file_upload/file_upload_service'

export class UserService {
  /**
   * Liste des utilisateurs (avec recherche et filtre par rôle)
   */
  async getUsers() {
    return User.query().orderBy('created_at', 'desc')
  }

  /**
   * Trouver un utilisateur par ID
   */
  async getUserById(id: string | number) {
    const user = await this.findUser(id)
    await user.load('subInfo')
    return user
  }

  /**
   * Créer un utilisateur
   */
  async createUser(data: CreateUserDTO) {
    const { subInfo, ...userPayload } = data
    return db.transaction(async (trx) => {
      // On utilise le client de transaction (trx) pour toutes les opérations DB
      const user = await User.create(userPayload, { client: trx })

      if (subInfo) await user.related('subInfo').create(subInfo, { client: trx })

      return user
    })
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string | number, data: UpdateUserDTO, authenticatedUser?: User) {
    const user = await this.findUser(id)

    const { subInfo, ...userPayload } = data

    // Vérifier si l'utilisateur tente de modifier son propre rôle
    if (userPayload.role !== undefined && authenticatedUser) {
      // Si l'utilisateur tente de modifier son propre rôle
      if (authenticatedUser.id === user.id) {
        // Seul un admin peut modifier son propre rôle
        if (authenticatedUser.role !== UserRole.ADMIN) {
          // Supprimer la modification du rôle
          delete userPayload.role
        }
      }
    }

    return await db.transaction(async (trx) => {
      user.useTransaction(trx)
      // Mise à jour des données utilisateur
      user.merge(userPayload)
      if (user.isDirty()) {
        await user.save()
      }

      // Mise à jour/création subInfo
      if (subInfo) {
        await user.load('subInfo')
        let subInfoModel = user.subInfo

        if (!subInfoModel) {
          // Création
          await user.related('subInfo').create(subInfo, { client: trx })
        } else {
          // Mise à jour avec vérification isDirty
          subInfoModel.useTransaction(trx)
          subInfoModel.merge(subInfo)
          if (subInfoModel.isDirty()) {
            // Évite l'UPDATE inutile
            await subInfoModel.save()
          }
        }
      }

      return user
    })
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string | number) {
    let user = await this.findUser(id)
    await user.load('subInfo')
    if (user.subInfo?.photoPath) await FileUploadService.deleteFile(`${user.subInfo?.photoPath}`)
    await user.delete()

    return true
  }

  /**
   * Activer/désactiver un utilisateur
   */
  async toggleUserStatus(id: string | number) {
    const user = await this.findUser(id)
    user.isActive = !user.isActive
    await user.save()
    return user
  }

  /**
   * Statistiques utilisateurs
   */
  async getUserStats() {
    const total = await User.query().count('* as total').first()
    const active = await User.query().where('is_active', true).count('* as count').first()
    const inactive = await User.query().where('is_active', false).count('* as count').first()
    const admins = await User.query().where('role', UserRole.ADMIN).count('* as count').first()
    const visitors = await User.query().where('role', UserRole.VISITOR).count('* as count').first()

    return {
      total: total?.$extras.total || 0,
      active: active?.$extras.count || 0,
      inactive: inactive?.$extras.count || 0,
      admins: admins?.$extras.count || 0,
      visitors: visitors?.$extras.count || 0,
    }
  }

  async findUser(id: string | number) {
    return await User.findOrFail(id)
  }
}
