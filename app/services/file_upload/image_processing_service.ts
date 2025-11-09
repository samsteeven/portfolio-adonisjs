import sharp from 'sharp'
import fs from 'node:fs/promises'
import logger from '@adonisjs/core/services/logger'

export interface ImageResizeOptions {
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export default class ImageProcessingService {
  /**
   * Dimensions par défaut pour les images de technologie
   */
  private static readonly DEFAULT_TECH_OPTIONS: ImageResizeOptions = {
    width: 800,
    height: 800,
    fit: 'contain',
    quality: 95,
    format: 'png', // PNG pour préserver la qualité des logos
  }

  /**
   * Redimensionne et optimise une image
   */
  static async processImage(filePath: string, options: ImageResizeOptions = {}): Promise<Buffer> {
    const opts = { ...this.DEFAULT_TECH_OPTIONS, ...options }

    try {
      const fileBuffer = await fs.readFile(filePath)

      return await sharp(fileBuffer)
        .resize(opts.width, opts.height, {
          fit: opts.fit,
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Fond transparent
        })
        .toFormat(opts.format!, {
          quality: opts.quality,
        })
        .toBuffer()
    } catch (error) {
      logger.error("Erreur lors du traitement de l'image:", error)
      throw new Error(`Impossible de traiter l'image: ${error.message}`)
    }
  }

  /**
   * Crée plusieurs versions d'une image (thumbnail, medium, large)
   */
  static async createMultipleSizes(filePath: string): Promise<{
    thumbnail: Buffer
    medium: Buffer
    large: Buffer
  }> {
    try {
      const fileBuffer = await fs.readFile(filePath)
      const metadata = await sharp(fileBuffer).metadata()
      const isPortrait = (metadata.height || 0) > (metadata.width || 0)

      const [thumbnail, medium, large] = await Promise.all([
        // Thumbnail - Qualité maximale car c'est la plus petite
        sharp(fileBuffer)
          .resize(isPortrait ? 400 : 500, isPortrait ? 500 : 400, {
            fit: 'inside',
            withoutEnlargement: true,
            // Améliore la netteté pour les petites tailles
            kernel: sharp.kernel.lanczos3,
          })
          .sharpen({ sigma: 0.5 }) // Ajoute de la netteté après le resize
          .webp({
            quality: 92, // Qualité plus élevée pour le thumbnail
            smartSubsample: false, // Meilleure qualité des couleurs
          })
          .toBuffer(),

        // Medium
        sharp(fileBuffer)
          .resize(400, 400, {
            fit: 'inside',
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3,
          })
          .webp({ quality: 88 })
          .toBuffer(),

        // Large - Peut avoir une qualité légèrement inférieure
        sharp(fileBuffer)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85 })
          .toBuffer(),
      ])

      return { thumbnail, medium, large }
    } catch (error) {
      logger.error('Erreur lors de la création des versions multiples:', error)
      throw new Error(`Impossible de créer les versions: ${error.message}`)
    }
  }

  /**
   * Optimise une image sans changer ses dimensions
   */
  static async optimizeImage(filePath: string, quality: number = 90): Promise<Buffer> {
    try {
      const fileBuffer = await fs.readFile(filePath)

      return await sharp(fileBuffer).webp({ quality }).toBuffer()
    } catch (error) {
      logger.error("Erreur lors de l'optimisation de l'image:", error)
      throw new Error(`Impossible d'optimiser l'image: ${error.message}`)
    }
  }

  /**
   * Récupère les métadonnées d'une image
   */
  static async getImageMetadata(filePath: string): Promise<sharp.Metadata> {
    try {
      const fileBuffer = await fs.readFile(filePath)
      return await sharp(fileBuffer).metadata()
    } catch (error) {
      throw new Error(`Impossible de lire les métadonnées: ${error.message}`)
    }
  }
}
