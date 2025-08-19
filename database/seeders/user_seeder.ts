import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { UserRole } from '#enums/user_role'

export default class extends BaseSeeder {
  async run() {
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password',
      role: UserRole.ADMIN,
    })
  }
}
