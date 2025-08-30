// Ajoutez ces méthodes à votre FileUploadService existant

import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import logger from '@adonisjs/core/services/logger'

export default class FileUploadTechnolyService {
  /**
   * Upload une image pour une technologie
   */
  static async uploadTechnologyImage(file: MultipartFile): Promise<string> {
    // Créer le nom de fichier unique
    const fileName = `technologies/${cuid()}.${file.extname}`
    await file.moveToDisk(fileName)

    return fileName
  }

  /**
   * Remplace une image de technologie existante
   */
  static async replaceTechnologyImage(
    newFile: MultipartFile,
    oldImagePath: string | null
  ): Promise<string> {
    // Uploader la nouvelle image
    const newImagePath = await this.uploadTechnologyImage(newFile)

    // Supprimer l'ancienne image si elle existe
    if (oldImagePath) {
      const oldFileName = oldImagePath.split('/').pop()
      if (oldFileName) {
        try {
          await this.deleteFile(oldFileName)
        } catch (error) {
          // Log l'erreur mais ne pas faire échouer l'opération
          logger.warn("Impossible de supprimer l'ancienne image:", error.message)
        }
      }
    }

    return newImagePath
  }

  /**
   * Supprime le fichier
   */
  static async deleteFile(fileName: string): Promise<void> {
    try {
      const exist = await drive.use().exists(fileName)
      if (exist) {
        await drive.use().delete(fileName)
      }
    } catch (error) {
      throw new Error(`Impossible de supprimer le fichier: ${error.message}`)
    }
  }
}
