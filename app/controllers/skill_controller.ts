import type { HttpContext } from '@adonisjs/core/http'
import SkillService from '#services/skill_service'
import { createSkillValidator, updateSkillValidator } from '#validators/skill'
import { inject } from '@adonisjs/core'
import SkillUploadService from '#services/file_upload_technolgy_service'
import FileUploadTechnolyService from '#services/file_upload_technolgy_service'
import SkillAuthorizationService from '#services/bouncer_technology_service'

@inject()
export default class SkillsController {
  public constructor(
    private skillService: SkillService,
    private skillAuthorizationService: SkillAuthorizationService
  ) {}

  /**
   * Liste des skills
   */
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const category = request.input('category', '')

    const skills = await this.skillService.getSkills({ page, limit, search, category })
    const categories = await this.skillService.getCategories()

    return inertia.render('admin/skills/index', {
      skills,
      categories,
    })
  }
  async show({ params, inertia, session, response }: HttpContext) {
    const skill = await this.skillService.getSkillById(params.id)
    if (!skill) {
      session.flash('error', 'Skill introuvable')
      return response.redirect().back()
    }
    return inertia.render('admin/skills/show', { skill })
  }

  async create({ inertia }: HttpContext) {
    const categories = await this.skillService.getCategories()
    return inertia.render('admin/skills/create', { categories })
  }

  async store({ request, response, session, bouncer }: HttpContext) {
    const autorize = await bouncer.with('SkillPolicy').allows('store')
    if (!autorize) {
      return this.skillAuthorizationService.handleUnauthorized(response, session)
    }

    const data = await request.validateUsing(createSkillValidator)
    let imgPath: string | undefined

    // Gestion de l'upload d'image
    if (data.imagePath?.isValid) {
      try {
        imgPath = await SkillUploadService.uploadTechnologyImage(data.imagePath, 'skills')
      } catch (error) {
        session.flash('error', error.message)
        return response.redirect().back()
      }
    }

    try {
      await this.skillService.createSkill({ ...data, imagePath: imgPath || null })

      session.flash('success', 'Skill créé avec succès')
      return response.redirect().back()
    } catch (e) {
      // Nettoyer l'image en cas d'erreur
      if (imgPath) {
        await SkillUploadService.deleteFile(imgPath)
      }
      session.flash('error', 'Erreur lors de la creation du skill')
      return response.redirect().back()
    }
  }

  async edit({ inertia, params, session, response }: HttpContext) {
    const skill = await this.skillService.getSkillById(params.id)
    if (!skill) {
      session.flash('error', 'Skill introuvable')
      return response.redirect().back()
    }
    const categories = await this.skillService.getCategories()
    return inertia.render('admin/skills/edit', { skill, categories })
  }

  async update({ request, response, session, params, bouncer }: HttpContext) {
    const autorize = await bouncer.with('SkillPolicy').allows('update')
    if (!autorize) {
      return this.skillAuthorizationService.handleUnauthorized(response, session)
    }

    const skill = await this.skillService.getSkillById(params.id)
    if (!skill) {
      session.flash('error', 'Skill introuvable')
      return response.redirect().back()
    }
    const data = await request.validateUsing(updateSkillValidator)

    try {
      let imgPath: string | undefined

      // Gérer le remplacement d'image si nécessaire
      if (data.imagePath?.isValid) {
        const oldImagePath = skill.imagePath
        imgPath = await FileUploadTechnolyService.replaceTechnologyImage(
          data.imagePath,
          oldImagePath,
          'skills'
        )
      }

      // Mettre à jour le skill
      try {
        await this.skillService.updateSkill(skill, {
          ...data,
          imagePath: imgPath || skill.imagePath,
        })
      } catch (e) {
        session.flash('error', e.message)
        return response.redirect().back()
      }

      session.flash('success', 'Skill mise à jour avec succès')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message || 'Erreur lors de la mise à jour du skill')
      return response.redirect().back()
    }
  }

  async destroy({ response, session, params, logger, bouncer }: HttpContext) {
    const autorize = await bouncer.with('SkillPolicy').allows('delete')
    if (!autorize) {
      return this.skillAuthorizationService.handleUnauthorized(response, session)
    }

    const skill = await this.skillService.getSkillById(params.id)
    if (!skill) {
      session.flash('error', 'Skill introuvable')
      return response.redirect().back()
    }

    try {
      // Supprimer l'image associée si elle existe
      if (skill.imagePath) {
        try {
          await FileUploadTechnolyService.deleteFile(skill.imagePath)
        } catch (error) {
          // Log l'erreur mais ne pas bloquer la suppression
          logger.warn("Erreur lors de la suppression de l'image:", error)
        }
      }

      await skill.delete()
      session.flash('success', 'Skill supprimé avec succès')
      return response.redirect().back()
    } catch (e) {
      session.flash('error', e.message || 'Erreur lors de la suppression du skill')
      return response.redirect().back()
    }
  }
  async toggleStatus({ response, session, params, bouncer }: HttpContext) {
    const autorize = await bouncer.with('SkillPolicy').allows('toggleStatus')
    if (!autorize) {
      return this.skillAuthorizationService.handleUnauthorized(response, session)
    }
    await this.skillService.toggleStatus(params.id)
    try {
      session.flash('success', 'Statut du skill mis à jour')
      return response.redirect().back()
    } catch (e) {
      session.flash('error', 'Erreur lors de la mise à jour du statut du skill')
      return response.redirect().back()
    }
  }
}
