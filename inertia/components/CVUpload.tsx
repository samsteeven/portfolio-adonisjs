import React, { useState, useRef } from 'react'
import { Upload, X, FileText, Eye, EyeOff, Maximize2 } from 'lucide-react'
import { toast } from 'sonner'

interface CVUploadWithPreviewProps {
  currentCVUrl?: string | null
  error?: string
  name?: string
}

export default function CVUploadWithPreview({
  currentCVUrl,
  error,
  name = 'subInfo[cv]',
}: CVUploadWithPreviewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (file: File) => {
    //Only accept PDF files
    const validTypes = ['application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez uniquement les fichiers PDF.')
      return
    }

    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux. Maximum 5MB.')
      return
    }

    setSelectedFile(file)

    // Créer une URL de prévisualisation pour les PDF
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0])
    }
  }

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setShowPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const canPreview = (url: string | null) => {
    if (!url) return false
    return url.endsWith('.pdf') || url.includes('application/pdf')
  }

  const displayUrl = previewUrl || currentCVUrl || null

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">CV (PDF)</label>

      {/* Zone d'upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          name={name}
          onChange={handleInputChange}
        />

        {selectedFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">Cliquez pour changer de fichier</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="text-sm font-medium mb-1">Cliquez ou glissez votre CV ici</p>
            <p className="text-xs text-gray-400">PDF (max 5MB)</p>
          </div>
        )}
      </div>

      {/* Barre d'actions et infos */}
      {(selectedFile || currentCVUrl) && (
        <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {selectedFile ? 'Nouveau fichier' : 'CV actuel'}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {selectedFile?.name || currentCVUrl?.split('/').pop()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {canPreview(displayUrl) && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 text-blue-600 hover:bg-blue-100rounded-lg transition-colors"
                title={showPreview ? 'Masquer la prévisualisation' : 'Prévisualiser'}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            {displayUrl && (
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Ouvrir dans un nouvel onglet"
                onClick={(e) => e.stopPropagation()}
              >
                <Maximize2 className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Prévisualisation intégrée */}
      {showPreview && canPreview(displayUrl) && displayUrl && (
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Aperçu du document</span>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative" style={{ height: '600px' }}>
            <iframe src={displayUrl} className="w-full h-full" title="Prévisualisation CV" />
          </div>
        </div>
      )}

      {/* Message si pas de prévisualisation possible */}
      {showPreview && !canPreview(displayUrl) && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            La prévisualisation n'est disponible que pour les fichiers PDF. Pour les documents Word,
            cliquez sur le bouton "Ouvrir dans un nouvel onglet".
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
