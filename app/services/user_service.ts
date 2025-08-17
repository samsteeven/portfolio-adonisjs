import { inject } from '@adonisjs/core'
import User from '#models/user'
import { Exception } from '@adonisjs/core/exceptions'
import hash from '@adonisjs/core/services/hash'
import { UserRole } from '#enums/user_role'

@inject()
export class UserService {
  /**
   * Récupère la liste des utilisateurs avec pagination et filtres
   */
  async getUsers({
    page,
    limit,
    search,
    role,
  }: {
    page: number
    limit: number
    search: string
    role: 'all' | UserRole
  }) {
    const query = User.query()

    // Filtre par recherche
    if (search) {
      query.where((subQuery) => {
        subQuery
          .where('email', 'like', `%${search}%`)
          .orWhere('first_name', 'like', `%${search}%`)
          .orWhere('last_name', 'like', `%${search}%`)
      })
    }

    // Filtre par rôle
    if (role && role !== 'all') {
      query.where('role', role)
    }

    // Pagination avec relations

    return await query.orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Récupère un utilisateur par son ID
   */
  async getUserById(id: string | number) {
    return await User.findOrFail(id)
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(data: {
    email: string
    password: string
    first_name: string
    last_name: string
    role: UserRole
    is_active: boolean
  }) {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      throw new Exception('Un utilisateur avec cet email existe déjà', {
        status: 400,
        code: 'EMAIL_ALREADY_EXISTS',
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await hash.make(data.password)

    // Créer l'utilisateur

    return await User.create({
      ...data,
      password: hashedPassword,
    })
  }

  /**
   * Met à jour un utilisateur
   */
  async updateUser(
    id: string | number,
    data: {
      email?: string
      password?: string
      first_name?: string
      last_name?: string
      role?: UserRole
      is_active?: boolean
    }
  ) {
    const user = await User.findOrFail(id)

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    if (data.email && data.email !== user.email) {
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        throw new Exception('Un utilisateur avec cet email existe déjà', {
          status: 400,
          code: 'EMAIL_ALREADY_EXISTS',
        })
      }
    }

    // Hasher le mot de passe si fourni
    if (data.password) {
      data.password = await hash.make(data.password)
    }

    // Mettre à jour l'utilisateur
    user.merge(data)
    await user.save()

    return user
  }

  /**
   * Supprime un utilisateur
   */
  async deleteUser(id: string | number) {
    const user = await User.findOrFail(id)

    // Empêcher la suppression de l'utilisateur connecté
    // TODO: Ajouter une vérification de l'utilisateur connecté

    await user.delete()
    return true
  }

  /**
   * Active/désactive un utilisateur
   */
  async toggleUserStatus(id: string | number) {
    const user = await User.findOrFail(id)
    user.isActive = !user.isActive
    await user.save()
    return user
  }

  /**
   * Récupère les statistiques des utilisateurs
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
