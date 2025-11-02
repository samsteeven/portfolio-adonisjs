import drive from '@adonisjs/drive/services/main'
import { cuid } from '@adonisjs/core/helpers'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import logger from '@adonisjs/core/services/logger'
import ImageProcessingService from '#services/file_upload/image_processing_service'

export default class FileUploadService {
  /**
   * Upload une photo de profil (avec redimensionnement automatique)
   */
  static async uploadProfilePhoto(photo: MultipartFile): Promise<string> {
    const fileId = cuid()
    const fileName = `profiles/${fileId}.${photo.extname}`

    try {
      const processedImage = await ImageProcessingService.processImage(photo.tmpPath!, {
        width: 400,
        height: 400,
        fit: 'cover', // Recadre en carré (meilleur pour photos de profil)
        quality: 90,
        format: 'webp',
      })

      // Upload l'image traitée
      await drive.use().put(fileName, processedImage)

      return fileName
    } catch (error) {
      logger.error("Erreur lors de l'upload de la photo:", error)
      throw new Error(`Impossible d'uploader la photo: ${error.message}`)
    }
  }

  /**
   * Uploadun fichier CV
   */
  static async uploadCV(cv: MultipartFile, username: string = cuid()): Promise<string> {
    const fileName = `cvs/cv_${username}.${cv.extname}`

    try {
      // Pour les fichiers PDF/DOC, on les upload directement sans traitement
      await cv.moveToDisk(fileName, { visibility: 'private' })
      return fileName
    } catch (error) {
      logger.error("Erreur lors de l'upload du CV:", error)
      throw new Error(`Impossible d'uploader le CV: ${error.message}`)
    }
  }

  /**
   * Remplace un CV
   */
  static async replaceCV(
    newCV: MultipartFile,
    oldCVPath: string | null,
    username?: string
  ): Promise<string> {
    // Upload du nouveau CV
    const newCVPath = await this.uploadCV(newCV, username)

    // Supprimer l'ancien CV si elle existe
    if (oldCVPath) {
      try {
        await this.deleteFile(oldCVPath)
      } catch (error) {
        logger.warn("Impossible de supprimer l'ancien CV:", error)
      }
    }

    return newCVPath
  }

  /**
   * Supprime un fichier
   */
  static async deleteFile(fileName: string): Promise<boolean> {
    try {
      const exists = await drive.use().exists(fileName)
      if (exists) {
        await drive.use().delete(fileName)
        return true
      }
      return false
    } catch (error) {
      logger.error('Erreur suppression fichier:', error)
      return false
    }
  }

  /**
   * Remplace une photo de profil
   */
  static async replaceProfilePhoto(
    newPhoto: MultipartFile,
    oldPhotoPath: string | null
  ): Promise<string> {
    // Upload de la nouvelle photo
    const newPhotoPath = await this.uploadProfilePhoto(newPhoto)

    // Supprimer l'ancienne photo si elle existe
    if (oldPhotoPath) {
      try {
        await this.deleteFile(oldPhotoPath)
      } catch (error) {
        logger.warn("Impossible de supprimer l'ancienne photo:", error)
      }
    }

    return newPhotoPath
  }
}
