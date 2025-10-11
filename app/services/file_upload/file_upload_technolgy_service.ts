import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import logger from '@adonisjs/core/services/logger'
import ImageProcessingService, {
  ImageResizeOptions,
} from '#services/file_upload/image_processing_service'

export default class FileUploadTechnologyService {
  /**
   * Upload une image pour une technologie (avec redimensionnement automatique)
   */
  static async uploadTechnologyImage(
    file: MultipartFile,
    path: string,
    options?: ImageResizeOptions
  ): Promise<string> {
    const fileId = cuid()
    const fileName = `${path}/${fileId}.${file.extname}`

    try {
      // Traiter l'image (redimensionner et optimiser)
      const processedImage = await ImageProcessingService.processImage(file.tmpPath!, options)

      // Upload l'image traitée
      await drive.use().put(fileName, processedImage)

      return fileName
    } catch (error) {
      logger.error("Erreur lors de l'upload de l'image:", error)
      throw new Error(`Impossible d'uploader l'image: ${error.message}`)
    }
  }

  /**
   * Remplace une image de technologie existante
   */
  static async replaceTechnologyImage(
    newFile: MultipartFile,
    oldImagePath: string | null,
    path: string,
    options?: ImageResizeOptions
  ): Promise<string> {
    // Uploader la nouvelle image
    const newImagePath = await this.uploadTechnologyImage(newFile, path, options)

    // Supprimer l'ancienne image si elle existe
    if (oldImagePath) {
      try {
        await this.deleteFile(oldImagePath)
      } catch (error) {
        logger.warn("Impossible de supprimer l'ancienne image:", error.message)
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
      const name = fileName.split('/').pop()

      if (exist && name) {
        await drive.use().delete(fileName)
      }
    } catch (error) {
      throw new Error(`Impossible de supprimer l'image: ${error.message}`)
    }
  }
}
