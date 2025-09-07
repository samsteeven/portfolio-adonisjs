import factory from '@adonisjs/lucid/factories'
import Commentaire from '#models/commentaire'
import { UserFactory } from '#factories/user_factory'

export const CommentaireFactory = factory
  .define(Commentaire, ({ faker }) => {
    return {
      message: faker.lorem.sentence(),
    }
  })
  .relation('user', () => UserFactory)
  .build()
