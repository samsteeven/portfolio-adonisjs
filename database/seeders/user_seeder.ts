import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserRole } from '../../app/enums/user_role.js'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    // Vérifier si un admin existe déjà
    const existingAdmin = await User.query().where('role', UserRole.ADMIN).first()

    if (!existingAdmin) {
      // Créer un utilisateur admin par défaut
      const hashedPassword = await hash.make('admin123')

      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      })

      console.log('✅ Utilisateur admin créé avec succès')
      console.log('📧 Email: admin@example.com')
      console.log('🔑 Mot de passe: admin123')
    } else {
      console.log('ℹ️ Un utilisateur admin existe déjà')
    }
  }
}
