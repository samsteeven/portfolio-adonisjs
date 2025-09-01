import React, { useState, useRef } from 'react'

interface UseImageUploadOptions {
  maxSize?: number // in MB
  allowedTypes?: string[]
  onImageChange?: (file: File | null) => void
  onError?: (error: string) => void
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    maxSize = 2,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    onImageChange,
    onError,
  } = options

  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Type de fichier non autorisé. Utilisez JPG, PNG ou WEBP.'
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `Le fichier est trop volumineux. Taille maximum: ${maxSize}MB`
    }

    return null
  }

  const handleFileChange = (file: File) => {
    const error = validateFile(file)
    if (error) {
      onError?.(error)
      return
    }

    setUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      setUploading(false)
      onImageChange?.(file)
    }
    reader.onerror = () => {
      setUploading(false)
      onError?.('Erreur lors de la lecture du fichier')
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const removeImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageChange?.(null)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return {
    preview,
    dragActive,
    uploading,
    fileInputRef,
    handleDrop,
    handleDrag,
    handleInputChange,
    removeImage,
    openFileDialog,
  }
}
