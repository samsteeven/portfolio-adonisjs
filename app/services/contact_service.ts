import Contact from '#models/contact'

export class ContactService {
  /**
   * Récupère la liste des messages de contact avec pagination et filtres
   */
  async getContacts({
    page,
    limit,
    search,
    status,
    dateFrom,
    dateTo,
  }: {
    page: number
    limit: number
    search: string
    status: string
    dateFrom: string
    dateTo: string
  }) {
    const query = Contact.query()

    // Filtre par recherche
    if (search) {
      query.where((subQuery) => {
        subQuery
          .where('name', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`)
          .orWhere('subject', 'like', `%${search}%`)
          .orWhere('message', 'like', `%${search}%`)
      })
    }

    // Filtre par statut
    if (status && status !== 'all') {
      query.where('status', status)
    }

    // Filtre par date
    if (dateFrom) {
      query.where('created_at', '>=', dateFrom)
    }
    if (dateTo) {
      query.where('created_at', '<=', dateTo)
    }

    // Pagination
    return await query.orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Récupère un message de contact par son ID
   */
  async getContactById(id: string | number) {
    return await Contact.findOrFail(id)
  }

  /**
   * Supprime un message de contact
   */
  async deleteContact(id: string | number) {
    const contact = await Contact.findOrFail(id)
    await contact.delete()
    return true
  }

  /**
   * Supprime plusieurs messages en lot
   */
  async deleteMultipleContacts(ids: number[]) {
    await Contact.query().whereIn('id', ids).delete()
    return true
  }
}
