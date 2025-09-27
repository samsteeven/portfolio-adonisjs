import Skill from '#models/skill'
import { CreateSkillValidatorDTO, UpdateSkillValidatorDTO } from '#validators/skill'

export default class SkillService {
  async getSkills({ page = 1, limit = 10 }) {
    const query = Skill.query()

    const paginator = await query.paginate(page, limit)
    return paginator.serialize() // ✅ serialize pour envoyer à Inertia
  }

  async getSkillById(id: number) {
    return await Skill.find(id)
  }

  async createSkill(data: CreateSkillValidatorDTO) {
    return await Skill.create(data)
  }

  async updateSkill(skill: Skill, data: UpdateSkillValidatorDTO) {
    return await skill.merge(data).save()
  }

  async getCategories() {
    return Skill.query()
      .select('category')
      .groupBy('category')
      .orderBy('category')
      .then((rows) => rows.map((row) => row.category))
  }
  async toggleStatus(id: number) {
    const skill = await Skill.findOrFail(id)
    skill.isActive = !skill.isActive
    await skill.save()
  }
}
