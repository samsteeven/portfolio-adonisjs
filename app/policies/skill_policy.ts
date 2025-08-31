import User from '#models/user'
import { UserRole } from '#enums/user_role'

export default class SkillPolicy {
  store(user: User) {
    return user.role === UserRole.ADMIN
  }

  update(user: User) {
    return user.role === UserRole.ADMIN
  }

  delete(user: User) {
    return user.role === UserRole.ADMIN
  }

  toggleStatus(user: User) {
    return user.role === UserRole.ADMIN
  }
}
