// Interface pour le modèle Project
import { Technology } from '~/types/technology'

export interface ProjectType {
  id: number
  title: string
  description: string | null
  imgPath: string | null
  demoPath: string | null
  githubPath: string | null
  isActive: boolean
  technologies: Technology[]
  createdAt: Date | string
  updatedAt: Date | string
}
