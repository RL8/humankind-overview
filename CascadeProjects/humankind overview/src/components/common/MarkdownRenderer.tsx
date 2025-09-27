'use client'

import React from 'react'
import DOMPurify from 'dompurify'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderMarkdown = (text: string): string => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4 text-gray-700">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-700">• $1</li>')
      
      // Tables
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map((cell: string) => cell.trim())
        const isHeader = content.includes('---')
        const tag = isHeader ? 'th' : 'td'
        const cellClass = isHeader 
          ? 'px-4 py-2 bg-gray-50 font-medium text-gray-900 border border-gray-200' 
          : 'px-4 py-2 text-gray-700 border border-gray-200'
        
        return `<tr>${cells.map((cell: string) => 
          `<${tag} class="${cellClass}">${cell}</${tag}>`
        ).join('')}</tr>`
      })
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700">')
      .replace(/\n/g, '<br>')
      
      // Wrap in paragraphs
      .replace(/^(?!<[h|l|t])/gm, '<p class="mb-4 text-gray-700">')
      .replace(/(?<!>)$/gm, '</p>')
      
      // Clean up empty paragraphs
      .replace(/<p class="mb-4 text-gray-700"><\/p>/g, '')
      .replace(/<p class="mb-4 text-gray-700"><br><\/p>/g, '')
  }

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: DOMPurify.sanitize(renderMarkdown(content))
      }}
    />
  )
}
