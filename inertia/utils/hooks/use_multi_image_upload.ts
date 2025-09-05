import React, { useState, useRef, useCallback } from 'react'

export interface ImageFile {
  file: File
  preview: string
  id: string // ID temporaire pour identifier l'image
}

interface UseMultiImageUploadProps {
  maxImages?: number
  maxSize?: number // en MB
  allowedTypes?: string[]
  onError?: (error: string) => void
  existingImages?: Array<{ id: number; imagePublicUrl: string }>
}

export function useMultiImageUpload({
  maxImages = 4,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  onError,
  existingImages = [],
}: UseMultiImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize * 1024 * 1024) {
        return `Le fichier "${file.name}" est trop volumineux (max: ${maxSize}MB)`
      }
      if (!allowedTypes.includes(file.type)) {
        return `Le format "${file.type}" n'est pas supporté`
      }
      return null
    },
    [maxSize, allowedTypes]
  )

  const addImages = useCallback(
    (files: FileList) => {
      const validFiles: File[] = []
      const errors: string[] = []

      Array.from(files).forEach((file) => {
        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          validFiles.push(file)
        }
      })

      if (errors.length > 0) {
        onError?.(errors.join(', '))
        return
      }

      setImages((prev) => {
        const remainingSlots =
          maxImages - prev.length - existingImages.length + imagesToDelete.length
        const filesToAdd = validFiles.slice(0, remainingSlots)

        if (filesToAdd.length < validFiles.length) {
          onError?.(
            `Seulement ${filesToAdd.length} image(s) ont été ajoutées (maximum ${maxImages} images)`
          )
        }

        const newImages = filesToAdd.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substr(2, 9),
        }))

        return [...prev, ...newImages]
      })
    },
    [validateFile, maxImages, onError, existingImages.length, imagesToDelete.length]
  )

  const removeImage = useCallback((imageId: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter((img) => img.id !== imageId)
    })
  }, [])

  const removeExistingImage = useCallback((imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId])
  }, [])

  const restoreExistingImage = useCallback((imageId: number) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId))
  }, [])

  const reorderImages = useCallback((startIndex: number, endIndex: number) => {
    setImages((prev) => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    })
  }, [])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addImages(e.target.files)
        e.target.value = '' // Reset input
      }
    },
    [addImages]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addImages(e.dataTransfer.files)
      }
    },
    [addImages]
  )

  const clearAllImages = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
  }, [images])

  const getFiles = useCallback((): File[] => {
    return images.map((img) => img.file)
  }, [images])

  const getTotalImageCount = useCallback(() => {
    return images.length + existingImages.length - imagesToDelete.length
  }, [images.length, existingImages.length, imagesToDelete.length])

  const canAddMore = useCallback(() => {
    return getTotalImageCount() < maxImages
  }, [getTotalImageCount, maxImages])

  const getExistingImagesForDisplay = useCallback(() => {
    return existingImages.filter((img) => !imagesToDelete.includes(img.id))
  }, [existingImages, imagesToDelete])

  // Cleanup function pour éviter les fuites mémoire
  const cleanup = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
  }, [images])

  return {
    // States
    images,
    dragActive,
    uploading,
    setUploading,
    imagesToDelete,
    fileInputRef,

    // Actions
    addImages,
    removeImage,
    removeExistingImage,
    restoreExistingImage,
    reorderImages,
    openFileDialog,
    handleInputChange,
    handleDrag,
    handleDrop,
    clearAllImages,
    cleanup,

    // Getters
    getFiles,
    getTotalImageCount,
    canAddMore,
    getExistingImagesForDisplay,
    maxImages,
  }
}
