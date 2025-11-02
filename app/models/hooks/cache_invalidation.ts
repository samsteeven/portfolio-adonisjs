import PortfolioService from '#services/portfolio_service'
import Technology from '#models/technology'
import Skill from '#models/skill'
import Project from '#models/project'
import BlogPost from '#models/blog_post'
import User from '#models/user'
import SubInfo from '#models/sub_info'

/**
 * Hooks pour invalider le cache automatiquement lors des modifications
 */

// === TECHNOLOGY HOOKS ===
Technology.after('create', async () => {
  await PortfolioService.invalidateTechnologies()
})

Technology.after('update', async () => {
  await PortfolioService.invalidateTechnologies()
})

Technology.after('delete', async () => {
  await PortfolioService.invalidateTechnologies()
})

// === SKILL HOOKS ===
Skill.after('create', async () => {
  await PortfolioService.invalidateSkills()
})

Skill.after('update', async () => {
  await PortfolioService.invalidateSkills()
})

Skill.after('delete', async () => {
  await PortfolioService.invalidateSkills()
})

// === PROJECT HOOKS ===
Project.after('create', async (project) => {
  await PortfolioService.invalidateProjects()
  await PortfolioService.invalidateProject(project.slug)
})

Project.after('update', async (project) => {
  await PortfolioService.invalidateProjects()
  await PortfolioService.invalidateProject(project.slug)
})

Project.after('delete', async (project) => {
  await PortfolioService.invalidateProjects()
  await PortfolioService.invalidateProject(project.slug)
})

// === BLOG POST HOOKS ===
BlogPost.after('create', async () => {
  await PortfolioService.invalidateRecentPosts()
})

BlogPost.after('update', async () => {
  await PortfolioService.invalidateRecentPosts()
})

BlogPost.after('delete', async () => {
  await PortfolioService.invalidateRecentPosts()
})

// === USER & SUBINFO HOOKS (pour les données globales du portfolio) ===
User.after('update', async (user) => {
  // Invalider seulement si c'est l'admin (propriétaire du portfolio)
  if (user.role === 'admin') {
    await PortfolioService.invalidatePortfolioOwnerCache()
  }
})

SubInfo.after('update', async (subInfo) => {
  // Invalider les données du portfolio si c'est le SubInfo d'un admin
  const user = await subInfo.related('user').query().first()
  if (user && user.role === 'admin') {
    await PortfolioService.invalidatePortfolioOwnerCache()
  }
})
