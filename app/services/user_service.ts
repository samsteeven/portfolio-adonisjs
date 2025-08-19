import { Exception } from '@adonisjs/core/exceptions'
import User from '#models/user'
import { UserRole } from '#enums/user_role'
import { CreateUserDTO, UpdateUserDTO } from '#validators/user_validator'

export class UserService {
  /**
   * Vérifie si l'email est unique (sinon lève une Exception)
   */
  private async ensureEmailUnique(email: string, excludeUserId?: number | string) {
    const existingUser = await User.findBy('email', email)
    if (existingUser && existingUser.id !== excludeUserId) {
      throw new Exception('Un utilisateur avec cet email existe déjà', {
        status: 400,
        code: 'EMAIL_ALREADY_EXISTS',
      })
    }
  }

  /**
   * Liste des utilisateurs (avec recherche et filtre par rôle)
   */
  async getUsers({ search, role }: { search?: string; role?: UserRole }) {
    const query = User.query()

    if (search) {
      query.where((sub) => {
        sub.whereILike('email', `%${search}%`).orWhereILike('username', `%${search}%`)
      })
    }

    if (role) query.where('role', role)

    return query.orderBy('created_at', 'desc')
  }

  /**
   * Trouver un utilisateur par ID
   */
  async getUserById(id: string | number) {
    return await User.findOrFail(id)
  }

  /**
   * Créer un utilisateur
   */
  async createUser(data: CreateUserDTO) {
    await this.ensureEmailUnique(data.email)
    return User.create(data)
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string | number, data: UpdateUserDTO) {
    const user = await User.findOrFail(id)

    if (data.email) await this.ensureEmailUnique(data.email, user.id)

    user.merge(data)
    await user.save()

    return user
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string | number) {
    const user = await User.findOrFail(id)
    await user.delete()
    return true
  }

  /**
   * Activer/désactiver un utilisateur
   */
  async toggleUserStatus(id: string | number) {
    const user = await User.findOrFail(id)
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
}
