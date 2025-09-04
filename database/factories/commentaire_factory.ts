import factory from '@adonisjs/lucid/factories'
import Commentaire from '#models/commentaire'
import { UserFactory } from '#factories/user_factory'

export const CommentaireFactory = factory
  .define(Commentaire, ({ faker }) => {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      message: faker.lorem.sentence(),
    }
  })
  .relation('user', () => UserFactory)
  .build()
