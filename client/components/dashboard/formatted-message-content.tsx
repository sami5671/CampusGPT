'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Copy, Check, ExternalLink, GraduationCap, Building2, Calendar, Megaphone, FileText, Download } from 'lucide-react'

interface FormattedMessageContentProps {
  content: string
}

export function FormattedMessageContent({ content }: FormattedMessageContentProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (url: string, title: string) => {
    if (!url || url === 'N/A') return
    try {
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-application`
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // Parse markdown-like bold, bullet points, and structure
  const renderFormattedText = (text: string) => {
    const blocks = text.split('\n\n')

    return blocks.map((block, bIdx) => {
      // Check if block represents a faculty record or structured entity
      const isFacultyBlock = block.includes('👨‍🏫') || block.toLowerCase().includes('faculty member:')
      const isClassBlock = block.includes('📚') || block.toLowerCase().includes('class course:')
      const isOfficeBlock = block.includes('🏢') || block.toLowerCase().includes('campus office:')
      const isAnnouncementBlock = block.includes('📢') || block.toLowerCase().includes('announcement title:')
      const isTemplateBlock = block.includes('📄') || block.toLowerCase().includes('application template:') || block.toLowerCase().includes('template:')

      if (isFacultyBlock) {
        return renderFacultyCard(block, bIdx)
      } else if (isClassBlock) {
        return renderClassCard(block, bIdx)
      } else if (isOfficeBlock) {
        return renderOfficeCard(block, bIdx)
      } else if (isAnnouncementBlock) {
        return renderAnnouncementCard(block, bIdx)
      } else if (isTemplateBlock) {
        return renderTemplateCard(block, bIdx)
      }

      // Regular text block with markdown parsing
      const lines = block.split('\n')
      return (
        <div key={bIdx} className="space-y-1.5 leading-relaxed">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim()
            if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
              const lineContent = trimmed.substring(1).trim()
              return (
                <div key={lIdx} className="flex items-start gap-2 text-xs md:text-sm pl-1 my-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/80 mt-1.5 flex-shrink-0" />
                  <div>{parseInlineMarkdown(lineContent)}</div>
                </div>
              )
            }
            if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.includes('**')) {
              return (
                <p key={lIdx} className="text-xs italic text-muted-foreground mt-2">
                  {parseInlineMarkdown(trimmed.substring(1, trimmed.length - 1))}
                </p>
              )
            }
            return (
              <p key={lIdx} className="text-xs md:text-sm text-foreground">
                {parseInlineMarkdown(line)}
              </p>
            )
          })}
        </div>
      )
    })
  }

  // Parse inline **bold** text and URLs into Download buttons
  const parseInlineMarkdown = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s\)]+)/g
    const parts = text.split(/(\*\*.*?\*\*|https?:\/\/[^\s\)]+)/g)

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.match(urlRegex)) {
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleDownload(part, 'application-document')}
            className="inline-flex items-center gap-1.5 px-3 py-1 my-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/35 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download Document</span>
          </button>
        )
      }
      return part
    })
  }

  // Render Faculty Info as a beautiful Glassmorphism Card
  const renderFacultyCard = (block: string, key: number) => {
    const lines = block.split('\n')
    let name = ''
    let designation = ''
    let department = ''
    let email = ''
    let officeRoom = ''
    let officeHours = ''
    let contactNumber = ''

    lines.forEach((line) => {
      const clean = line.replace(/👨‍🏫|\*\*|•/g, '').trim()
      if (line.includes('👨‍🏫') || line.toLowerCase().includes('faculty member:')) {
        const parts = clean.replace(/faculty member:/i, '').trim().split('(')
        name = parts[0]?.trim() || ''
        if (parts[1]) designation = parts[1].replace(')', '').trim()
      } else if (clean.toLowerCase().includes('department:')) {
        department = clean.split(/department:/i)[1]?.trim() || ''
      } else if (clean.toLowerCase().includes('email:')) {
        email = clean.split(/email:/i)[1]?.trim() || ''
      } else if (clean.toLowerCase().includes('office room:')) {
        officeRoom = clean.split(/office room:/i)[1]?.trim() || ''
      } else if (clean.toLowerCase().includes('office hours:')) {
        officeHours = clean.split(/office hours:/i)[1]?.trim() || ''
      } else if (clean.toLowerCase().includes('contact number:') || clean.toLowerCase().includes('contact:')) {
        contactNumber = clean.split(/contact number:|contact:/i)[1]?.trim() || ''
      }
    })

    return (
      <div
        key={key}
        className="my-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 border border-primary/30 shadow-md backdrop-blur-md space-y-3 transition-all hover:border-primary/50"
      >
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-sm font-bold text-sm">
              {name ? name.charAt(0).toUpperCase() : '👨‍🏫'}
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground leading-tight">{name || 'Faculty Member'}</h4>
              {designation && (
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary border border-primary/30">
                  {designation}
                </span>
              )}
            </div>
          </div>
          {department && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-accent/15 text-accent border border-accent/30 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 inline" /> {department}
            </span>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {officeRoom && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card/60 border border-border/30">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <div>
                <span className="text-[10px] text-muted-foreground block leading-none">Office Room</span>
                <span className="font-medium text-foreground">{officeRoom}</span>
              </div>
            </div>
          )}

          {officeHours && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card/60 border border-border/30">
              <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <div>
                <span className="text-[10px] text-muted-foreground block leading-none">Office Hours</span>
                <span className="font-medium text-foreground">{officeHours}</span>
              </div>
            </div>
          )}

          {email && email !== 'N/A' && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary transition group"
            >
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium truncate flex-1">{email}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
            </a>
          )}

          {contactNumber && contactNumber !== 'N/A' && (
            <a
              href={`tel:${contactNumber}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition group"
            >
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium flex-1">{contactNumber}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
            </a>
          )}
        </div>
      </div>
    )
  }

  // Render Application Template Card with Download Button
  const renderTemplateCard = (block: string, key: number) => {
    const lines = block.split('\n')
    let templateName = ''
    let description = ''
    let downloadUrl = ''

    lines.forEach((line) => {
      const clean = line.replace(/📄|\*\*|•/g, '').trim()
      if (line.includes('📄') || line.toLowerCase().includes('application template:')) {
        templateName = clean.replace(/application template:/i, '').trim()
      } else if (clean.toLowerCase().includes('description:')) {
        description = clean.split(/description:/i)[1]?.trim() || ''
      } else if (
        clean.toLowerCase().includes('download link:') || 
        clean.toLowerCase().includes('preview/download:') || 
        clean.toLowerCase().includes('link:')
      ) {
        const match = line.match(/(https?:\/\/[^\s\)]+)/i)
        if (match) {
          downloadUrl = match[1]
        } else {
          const parts = clean.split(/download link:|preview\/download:|link:/i)
          downloadUrl = parts[1]?.trim() || ''
        }
      } else if (line.match(/(https?:\/\/[^\s\)]+)/i)) {
        const match = line.match(/(https?:\/\/[^\s\)]+)/i)
        if (match) downloadUrl = match[1]
      }
    })

    if (!templateName) {
      const firstLine = lines[0]?.replace(/📄|\*\*/g, '').trim() || 'Application Template'
      templateName = firstLine
    }

    return (
      <div
        key={key}
        className="my-3 p-4 rounded-xl bg-gradient-to-br from-indigo-500/15 via-card/90 to-purple-500/15 border border-indigo-500/35 shadow-lg space-y-3 backdrop-blur-md transition-all hover:border-indigo-500/50"
      >
        <div className="flex items-center gap-3 border-b border-border/30 pb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg flex-shrink-0 shadow-inner">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm md:text-base text-foreground leading-tight truncate">
              {templateName}
            </h4>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Official Application Form
            </span>
          </div>
        </div>

        {description && description !== 'N/A' && (
          <p className="text-xs text-muted-foreground leading-relaxed pl-1">
            {description}
          </p>
        )}

        {downloadUrl && downloadUrl !== 'N/A' ? (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleDownload(downloadUrl, templateName)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span>Download Application Form</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 text-xs text-muted-foreground italic">
            Download file link will be attached shortly by campus administration.
          </div>
        )}
      </div>
    )
  }

  // Render Class Schedule Card
  const renderClassCard = (block: string, key: number) => {
    return (
      <div
        key={key}
        className="my-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 via-card/80 to-purple-500/10 border border-blue-500/30 shadow-md space-y-2"
      >
        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
          <Calendar className="w-4 h-4" />
          <span>{parseInlineMarkdown(block.split('\n')[0] || '')}</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1 pl-6">
          {block.split('\n').slice(1).map((l, i) => (
            <p key={i}>{parseInlineMarkdown(l)}</p>
          ))}
        </div>
      </div>
    )
  }

  // Render Office Card with Location Map Button
  const renderOfficeCard = (block: string, key: number) => {
    const lines = block.split('\n')
    let officeName = ''
    let building = ''
    let room = ''
    let email = ''
    let hours = ''
    let mapUrl = ''

    lines.forEach((line) => {
      const clean = line.replace(/🏢|\*\*|•/g, '').trim()
      if (line.includes('🏢') || line.toLowerCase().includes('campus office:')) {
        officeName = clean.replace(/campus office:/i, '').trim()
      } else if (clean.toLowerCase().includes('building:')) {
        building = clean.split(/building:/i)[1]?.trim() || ''
      } else if (clean.toLowerCase().includes('email:')) {
        email = clean.split(/email:/i)[1]?.trim() || ''
      } else if (clean.toLowerCase().includes('hours:')) {
        hours = clean.split(/hours:/i)[1]?.trim() || ''
      } else if (clean.toLowerCase().includes('map location:') || clean.toLowerCase().includes('map link:')) {
        const match = line.match(/(https?:\/\/[^\s\)]+)/i)
        if (match) {
          mapUrl = match[1]
        } else {
          const parts = clean.split(/map location:|map link:/i)
          mapUrl = parts[1]?.trim() || ''
        }
      } else if (line.match(/(https?:\/\/[^\s\)]+)/i) && !mapUrl) {
        const match = line.match(/(https?:\/\/[^\s\)]+)/i)
        if (match) mapUrl = match[1]
      }
    })

    if (!officeName) {
      officeName = lines[0]?.replace(/🏢|\*\*/g, '').trim() || 'Campus Office'
    }

    if (!mapUrl && officeName) {
      const query = `${officeName} ${building}`.replace(/\s+/g, '+')
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
    }

    return (
      <div
        key={key}
        className="my-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 via-card/90 to-teal-500/15 border border-emerald-500/35 shadow-lg space-y-3 backdrop-blur-md transition-all hover:border-emerald-500/50"
      >
        <div className="flex items-center gap-3 border-b border-border/30 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg flex-shrink-0 shadow-inner">
            <Building2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm md:text-base text-foreground leading-tight truncate">
              {officeName}
            </h4>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              Campus Office Directory
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {building && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card/60 border border-border/30">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-muted-foreground block leading-none">Location</span>
                <span className="font-medium text-foreground">{building}</span>
              </div>
            </div>
          )}

          {hours && hours !== 'N/A' && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card/60 border border-border/30">
              <Clock className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-muted-foreground block leading-none">Operating Hours</span>
                <span className="font-medium text-foreground">{hours}</span>
              </div>
            </div>
          )}

          {email && email !== 'N/A' && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition group"
            >
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium truncate flex-1">{email}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
            </a>
          )}
        </div>

        {mapUrl && (
          <div className="pt-2 border-t border-border/20">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>View Campus Location Map</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        )}
      </div>
    )
  }

  // Render Announcement Card
  const renderAnnouncementCard = (block: string, key: number) => {
    return (
      <div
        key={key}
        className="my-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-card/80 to-orange-500/10 border border-amber-500/30 shadow-md space-y-2"
      >
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Megaphone className="w-4 h-4" />
          <span>{parseInlineMarkdown(block.split('\n')[0] || '')}</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1 pl-6">
          {block.split('\n').slice(1).map((l, i) => (
            <p key={i}>{parseInlineMarkdown(l)}</p>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-0 right-0 p-1.5 text-muted-foreground hover:text-foreground bg-card/80 border border-border/40 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm"
        title="Copy response"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Rendered Content */}
      <div className="space-y-2 pr-6">
        {renderFormattedText(content)}
      </div>
    </div>
  )
}
