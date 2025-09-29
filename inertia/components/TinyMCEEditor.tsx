import { Editor } from '@tinymce/tinymce-react'
import { useEffect, useState } from 'react'

interface TinyMCEEditorProps {
  value: string
  onEditorChange: (content: string) => void
  placeholder?: string
  height?: number
}

export default function TinyMCEEditor({
  value,
  onEditorChange,
  placeholder = 'Write your content here...',
  height = 500,
}: TinyMCEEditorProps) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    if (!isClient) {
      setIsClient(true)
    }
  }, [])
  if (!isClient) {
    return (
      <div
        className="border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          <span className="text-sm">Chargement de l'éditeur...</span>
        </div>
      </div>
    )
  }
  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      value={value}
      licenseKey={'gpl'}
      onEditorChange={onEditorChange}
      init={{
        base_url: '/tinymce',
        suffix: '.min',
        height: height,
        menubar: false,
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'help',
          'wordcount',
        ],
        toolbar:
          'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | code | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder: placeholder,
      }}
    />
  )
}
