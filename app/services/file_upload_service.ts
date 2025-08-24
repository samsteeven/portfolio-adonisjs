import drive from '@adonisjs/drive/services/main'
import { cuid } from '@adonisjs/core/helpers'

export default class FileUploadService {
  static async uploadProfilePhoto(photo: any): Promise<string | undefined> {
    const fileName = `profiles/${cuid()}.${photo.extname}`

    await photo.moveToDisk(fileName)
    return fileName
  }

  static async deleteFile(fileName: string): Promise<boolean> {
    try {
      const exists = await drive.use().exists(fileName)
      if (exists) {
        await drive.use().delete(fileName)
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur suppression fichier:', error)
      return false
    }
  }

  static async replaceProfilePhoto(
    newPhoto: any,
    oldPhotoPath: string | null
  ): Promise<string | undefined> {
    let newPhotoUrl: string | undefined

    // Upload de la nouvelle photo
    if (newPhoto?.isValid) {
      newPhotoUrl = await this.uploadProfilePhoto(newPhoto)
    }

    // Supprimer l'ancienne photo si elle existe et qu'une nouvelle a été uploadée
    if (newPhotoUrl && oldPhotoPath) {
      const oldFileName = oldPhotoPath.split('/').pop()
      if (oldFileName) {
        await this.deleteFile(oldFileName)
      }
    }

    return newPhotoUrl
  }
}
