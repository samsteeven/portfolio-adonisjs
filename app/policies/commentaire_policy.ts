import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { UserRole } from '#enums/user_role'
import Commentaire from '#models/commentaire'

export default class CommentairePolicy extends BasePolicy {
  store(user: User) {
    return user.role === UserRole.ADMIN
  }

  show(user: User) {
    return user.role === UserRole.ADMIN
  }

  delete(user: User, commentaire: Commentaire) {
    return user.id === commentaire.userId || user.role === UserRole.ADMIN
  }

  addReaction(user: User) {
    return user.role === UserRole.ADMIN
  }
}
