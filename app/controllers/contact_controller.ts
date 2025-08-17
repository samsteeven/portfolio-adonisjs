import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ContactService } from '#services/contact_service'

@inject()
export default class ContactController {
  constructor(private contactService: ContactService) {}

  /**
   * Affiche la liste des messages de contact avec pagination et filtres
   */
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const status = request.input('status', 'all')
    const dateFrom = request.input('date_from', '')
    const dateTo = request.input('date_to', '')

    const contacts = await this.contactService.getContacts({
      page,
      limit,
      search,
      status,
      dateFrom,
      dateTo,
    })

    return inertia.render('admin/contacts', { contacts })
  }

  /**
   * Affiche un message de contact spécifique
   */
  async show({ inertia, params }: HttpContext) {
    const contact = await this.contactService.getContactById(params.id)
    return inertia.render('admin/contacts/show', { contact })
  }

  /**
   * Supprime un message de contact
   */
  async destroy({ response, params, session }: HttpContext) {
    try {
      await this.contactService.deleteContact(params.id)

      session.flash('success', 'Message supprimé avec succès')
      return response.redirect().toRoute('admin.contacts')
    } catch (error) {
      session.flash('error', 'Erreur lors de la suppression du message')
      return response.redirect().back()
    }
  }

  /**
   * Supprime plusieurs messages en lot
   */
  async destroyMultiple({ request, response, session }: HttpContext) {
    try {
      const { ids } = request.only(['ids'])

      if (!ids || !Array.isArray(ids)) {
        throw new Error('IDs invalides')
      }

      await this.contactService.deleteMultipleContacts(ids)

      session.flash('success', `${ids.length} messages supprimés avec succès`)
      return response.json({ success: true, count: ids.length })
    } catch (error) {
      session.flash('error', 'Erreur lors de la suppression en lot')
      return response.status(500).json({ error: 'Erreur serveur' })
    }
  }
}
