import DOMPurify from 'isomorphic-dompurify'
import { JSX } from 'react'

interface SafeHTMLProps {
  html: string
  className?: string
  searchTerm?: string
  as?: keyof JSX.IntrinsicElements
  allowedTags?: string[]
  allowedAttributes?: string[]
}

export default function SafeHTML({
  html,
  className = '',
  searchTerm = '',
  as: Component = 'div',
  allowedTags,
  allowedAttributes,
}: SafeHTMLProps) {
  if (!html) return null

  let processedHTML = html
  // Configuration correcte pour DOMPurify
  const config = {
    ALLOWED_TAGS: allowedTags || [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'code',
      'pre',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'span',
      'div',
    ],
    ALLOWED_ATTR: allowedAttributes || [
      'href',
      'title',
      'target',
      'rel',
      'src',
      'alt',
      'width',
      'height',
      'class',
      'id',
      'style',
    ],
    ALLOW_DATA_ATTR: false,
  }

  // Nettoyer le HTML
  processedHTML = DOMPurify.sanitize(processedHTML, config)

  // 2. Ensuite, ajouter le highlighting si terme de recherche
  if (searchTerm.trim()) {
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')

    processedHTML = processedHTML.replace(/(<[^>]+>)|([^<]+)/g, (_match, tag, text) => {
      if (tag) return tag
      return text.replace(
        regex,
        '<mark class="bg-pink-500/30 text-pink-200 px-1 rounded">$1</mark>'
      )
    })
  }
  return <Component className={className} dangerouslySetInnerHTML={{ __html: processedHTML }} />
}
