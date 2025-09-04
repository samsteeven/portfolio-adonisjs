import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { UserRole } from '#enums/user_role'
import { SubInfoFactory } from './sub_info_factory.js'
import { CommentaireFactory } from './commentaire_factory.js'

export const UserFactory = factory
  .define(User, ({ faker }) => {
    return {
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: UserRole.VISITOR,
      isActive: true,
      provider: 'credentials',
    }
  })
  .relation('subInfo', () => SubInfoFactory)
  .relation('commentaires', () => CommentaireFactory)
  .build()
