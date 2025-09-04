import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { CommentaireFactory } from '#factories/commentaire_factory'

export default class extends BaseSeeder {
  async run() {
    // On utilise .with('user') pour créer un utilisateur pour chaque commentaire
    await CommentaireFactory.with('user').createMany(5)
  }
}
