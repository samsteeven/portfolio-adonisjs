import DOMPurify from 'isomorphic-dompurify'
import { JSX } from 'react'

interface SafeHTMLProps {
  html: string
  className?: string
  as?: keyof JSX.IntrinsicElements
  allowedTags?: string[]
  allowedAttributes?: string[]
}

export default function SafeHTML({
  html,
  className = '',
  as: Component = 'div',
  allowedTags,
  allowedAttributes,
}: SafeHTMLProps) {
  if (!html) return null

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
  const cleanHTML = DOMPurify.sanitize(html, config)

  return <Component className={className} dangerouslySetInnerHTML={{ __html: cleanHTML }} />
}
