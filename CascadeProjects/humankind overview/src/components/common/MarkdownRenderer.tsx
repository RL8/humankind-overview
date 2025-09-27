'use client'

import React from 'react'
import DOMPurify from 'dompurify'

interface MarkdownRendererProps {
  content: string
  className?: string
  theme?: 'default' | 'minimal' | 'academic' | 'modern' | 'warm'
}

export default function MarkdownRenderer({ content, className = '', theme = 'default' }: MarkdownRendererProps) {
  // Check if content is already HTML (from remark processing)
  const isHtml = content.includes('<') && content.includes('>')
  
  // Theme configurations
  const themes = {
    default: {
      h1: 'text-3xl font-bold text-gray-900 mt-8 mb-6 border-b border-gray-200 pb-2',
      h2: 'text-2xl font-semibold text-gray-900 mt-6 mb-4',
      h3: 'text-xl font-semibold text-gray-900 mt-5 mb-3',
      h4: 'text-lg font-medium text-gray-900 mt-4 mb-2',
      h5: 'text-base font-medium text-gray-900 mt-3 mb-2',
      h6: 'text-sm font-medium text-gray-900 mt-3 mb-2',
      p: 'mb-4 text-gray-700 leading-relaxed',
      strong: 'font-semibold text-gray-900',
      em: 'italic text-gray-800',
      code: 'bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono',
      ul: 'mb-4 ml-6 space-y-1',
      ol: 'mb-4 ml-6 space-y-1 list-decimal',
      li: 'text-gray-700',
      table: 'min-w-full border-collapse border border-gray-200 rounded-lg',
      tableWrapper: 'overflow-x-auto mb-6',
      thead: 'bg-gray-50',
      tbody: 'bg-white divide-y divide-gray-200',
      th: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200',
      td: 'px-4 py-3 text-sm text-gray-700 border border-gray-200',
      tr: 'hover:bg-gray-50',
      blockquote: 'border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700',
      hr: 'my-8 border-t border-gray-200',
      a: 'text-blue-600 hover:text-blue-800 underline'
    },
    minimal: {
      h1: 'text-2xl font-light text-gray-800 mt-6 mb-4',
      h2: 'text-xl font-light text-gray-800 mt-5 mb-3',
      h3: 'text-lg font-medium text-gray-800 mt-4 mb-2',
      h4: 'text-base font-medium text-gray-800 mt-3 mb-2',
      h5: 'text-sm font-medium text-gray-800 mt-3 mb-2',
      h6: 'text-xs font-medium text-gray-800 mt-3 mb-2',
      p: 'mb-3 text-gray-600 leading-relaxed',
      strong: 'font-medium text-gray-800',
      em: 'italic text-gray-700',
      code: 'bg-gray-50 text-gray-700 px-1 py-0.5 rounded text-xs font-mono',
      ul: 'mb-3 ml-4 space-y-0.5',
      ol: 'mb-3 ml-4 space-y-0.5 list-decimal',
      li: 'text-gray-600',
      table: 'min-w-full border-collapse border border-gray-100',
      tableWrapper: 'overflow-x-auto mb-4',
      thead: 'bg-gray-25',
      tbody: 'bg-white',
      th: 'px-3 py-2 text-left text-xs font-medium text-gray-600 border border-gray-100',
      td: 'px-3 py-2 text-sm text-gray-600 border border-gray-100',
      tr: '',
      blockquote: 'border-l-2 border-gray-300 pl-3 py-1 mb-3 text-gray-600 italic',
      hr: 'my-6 border-t border-gray-100',
      a: 'text-gray-700 hover:text-gray-900 underline'
    },
    academic: {
      h1: 'text-3xl font-bold text-gray-900 mt-8 mb-6 text-center border-b-2 border-gray-300 pb-3',
      h2: 'text-2xl font-bold text-gray-900 mt-7 mb-5',
      h3: 'text-xl font-semibold text-gray-900 mt-6 mb-4',
      h4: 'text-lg font-semibold text-gray-900 mt-5 mb-3',
      h5: 'text-base font-semibold text-gray-900 mt-4 mb-2',
      h6: 'text-sm font-semibold text-gray-900 mt-4 mb-2',
      p: 'mb-4 text-gray-800 leading-7 text-justify',
      strong: 'font-bold text-gray-900',
      em: 'italic text-gray-800',
      code: 'bg-gray-200 text-gray-900 px-2 py-1 rounded text-sm font-mono border',
      ul: 'mb-4 ml-8 space-y-2',
      ol: 'mb-4 ml-8 space-y-2 list-decimal',
      li: 'text-gray-800',
      table: 'min-w-full border-collapse border-2 border-gray-400',
      tableWrapper: 'overflow-x-auto mb-6',
      thead: 'bg-gray-200',
      tbody: 'bg-white',
      th: 'px-4 py-3 text-left text-sm font-bold text-gray-900 border-2 border-gray-400',
      td: 'px-4 py-3 text-sm text-gray-800 border-2 border-gray-400',
      tr: '',
      blockquote: 'border-l-4 border-gray-500 pl-6 py-3 mb-6 bg-gray-100 text-gray-800 italic text-lg',
      hr: 'my-10 border-t-2 border-gray-400',
      a: 'text-blue-800 hover:text-blue-600 underline font-medium'
    },
    modern: {
      h1: 'text-4xl font-black text-gray-900 mt-10 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
      h2: 'text-3xl font-bold text-gray-900 mt-8 mb-6',
      h3: 'text-2xl font-semibold text-gray-900 mt-7 mb-5',
      h4: 'text-xl font-semibold text-gray-900 mt-6 mb-4',
      h5: 'text-lg font-medium text-gray-900 mt-5 mb-3',
      h6: 'text-base font-medium text-gray-900 mt-4 mb-3',
      p: 'mb-5 text-gray-700 leading-relaxed text-lg',
      strong: 'font-bold text-gray-900',
      em: 'italic text-gray-800',
      code: 'bg-gray-900 text-green-400 px-2 py-1 rounded text-sm font-mono',
      ul: 'mb-5 ml-6 space-y-2',
      ol: 'mb-5 ml-6 space-y-2 list-decimal',
      li: 'text-gray-700',
      table: 'min-w-full border-collapse border border-gray-300 rounded-xl shadow-lg',
      tableWrapper: 'overflow-x-auto mb-8',
      thead: 'bg-gradient-to-r from-gray-50 to-gray-100',
      tbody: 'bg-white divide-y divide-gray-200',
      th: 'px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border border-gray-300',
      td: 'px-6 py-4 text-sm text-gray-700 border border-gray-300',
      tr: 'hover:bg-gray-50 transition-colors duration-200',
      blockquote: 'border-l-4 border-blue-500 pl-6 py-4 mb-6 bg-blue-50 text-gray-800 italic text-lg rounded-r-lg',
      hr: 'my-10 border-t-2 border-gradient-to-r from-blue-500 to-purple-500',
      a: 'text-blue-600 hover:text-purple-600 font-medium transition-colors duration-200'
    },
    warm: {
      h1: 'text-3xl font-bold text-amber-900 mt-8 mb-6 border-b-2 border-amber-200 pb-3',
      h2: 'text-2xl font-semibold text-amber-800 mt-6 mb-4',
      h3: 'text-xl font-semibold text-amber-800 mt-5 mb-3',
      h4: 'text-lg font-medium text-amber-800 mt-4 mb-2',
      h5: 'text-base font-medium text-amber-800 mt-3 mb-2',
      h6: 'text-sm font-medium text-amber-800 mt-3 mb-2',
      p: 'mb-4 text-amber-900 leading-relaxed',
      strong: 'font-semibold text-amber-900',
      em: 'italic text-amber-800',
      code: 'bg-amber-100 text-amber-900 px-2 py-1 rounded text-sm font-mono border border-amber-200',
      ul: 'mb-4 ml-6 space-y-1',
      ol: 'mb-4 ml-6 space-y-1 list-decimal',
      li: 'text-amber-800',
      table: 'min-w-full border-collapse border border-amber-200 rounded-lg',
      tableWrapper: 'overflow-x-auto mb-6',
      thead: 'bg-amber-50',
      tbody: 'bg-amber-25 divide-y divide-amber-200',
      th: 'px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider border border-amber-200',
      td: 'px-4 py-3 text-sm text-amber-800 border border-amber-200',
      tr: 'hover:bg-amber-50',
      blockquote: 'border-l-4 border-amber-400 pl-4 py-3 mb-4 bg-amber-50 italic text-amber-800 rounded-r-lg',
      hr: 'my-8 border-t border-amber-200',
      a: 'text-amber-700 hover:text-amber-900 underline font-medium'
    }
  }
  
  const currentTheme = themes[theme]
  
  const renderMarkdown = (text: string): string => {
    if (isHtml) {
      // Content is already processed HTML from remark, add theme-based Tailwind classes
      return text
        // Headers (add group class for hover effects on heading links)
        .replace(/<h1([^>]*)>/g, `<h1$1 class="${currentTheme.h1} group">`)
        .replace(/<h2([^>]*)>/g, `<h2$1 class="${currentTheme.h2} group">`)
        .replace(/<h3([^>]*)>/g, `<h3$1 class="${currentTheme.h3} group">`)
        .replace(/<h4([^>]*)>/g, `<h4$1 class="${currentTheme.h4} group">`)
        .replace(/<h5([^>]*)>/g, `<h5$1 class="${currentTheme.h5} group">`)
        .replace(/<h6([^>]*)>/g, `<h6$1 class="${currentTheme.h6} group">`)
        
        // Paragraphs
        .replace(/<p([^>]*)>/g, `<p$1 class="${currentTheme.p}">`)
        
        // Text formatting
        .replace(/<strong([^>]*)>/g, `<strong$1 class="${currentTheme.strong}">`)
        .replace(/<em([^>]*)>/g, `<em$1 class="${currentTheme.em}">`)
        .replace(/<code([^>]*)>/g, `<code$1 class="${currentTheme.code}">`)
        
        // Lists
        .replace(/<ul([^>]*)>/g, `<ul$1 class="${currentTheme.ul}">`)
        .replace(/<ol([^>]*)>/g, `<ol$1 class="${currentTheme.ol}">`)
        .replace(/<li([^>]*)>/g, `<li$1 class="${currentTheme.li}">`)
        
        // Tables
        .replace(/<table([^>]*)>/g, `<div class="${currentTheme.tableWrapper}"><table$1 class="${currentTheme.table}">`)
        .replace(/<\/table>/g, '</table></div>')
        .replace(/<thead([^>]*)>/g, `<thead$1 class="${currentTheme.thead}">`)
        .replace(/<tbody([^>]*)>/g, `<tbody$1 class="${currentTheme.tbody}">`)
        .replace(/<th([^>]*)>/g, `<th$1 class="${currentTheme.th}">`)
        .replace(/<td([^>]*)>/g, `<td$1 class="${currentTheme.td}">`)
        .replace(/<tr([^>]*)>/g, `<tr$1 class="${currentTheme.tr}">`)
        
        // Blockquotes
        .replace(/<blockquote([^>]*)>/g, `<blockquote$1 class="${currentTheme.blockquote}">`)
        
        // Horizontal rules
        .replace(/<hr([^>]*)>/g, `<hr$1 class="${currentTheme.hr}">`)
        
        // Links
        .replace(/<a([^>]*)>/g, `<a$1 class="${currentTheme.a}">`)
        
        // Heading links (generated by rehype-autolink-headings)
        .replace(/<a class="heading-link"([^>]*)>/g, `<a class="heading-link text-gray-400 hover:text-gray-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-underline"$1 title="Link to this section">`)
    }
    
    // Fallback to regex processing for plain markdown
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
