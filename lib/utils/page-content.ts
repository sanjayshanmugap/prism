export interface PageContent {
  title: string
  text: string
  headings: string[]
  links: string[]
  images: string[]
}

export function extractPageContent(): PageContent {
  if (typeof window === 'undefined') {
    return {
      title: '',
      text: '',
      headings: [],
      links: [],
      images: []
    }
  }

  // Extract title
  const title = document.title || ''

  // Extract main text content
  const mainContent = document.querySelector('main, article, .content, #content') || document.body
  const textContent = mainContent.textContent || ''
  
  // Clean up text content
  const cleanText = textContent
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()

  // Extract headings
  const headings: string[] = []
  const headingElements = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headingElements.forEach(heading => {
    const text = heading.textContent?.trim()
    if (text) headings.push(text)
  })

  // Extract links
  const links: string[] = []
  const linkElements = mainContent.querySelectorAll('a[href]')
  linkElements.forEach(link => {
    const href = link.getAttribute('href')
    const text = link.textContent?.trim()
    if (href && text) {
      links.push(`${text}: ${href}`)
    }
  })

  // Extract images
  const images: string[] = []
  const imageElements = mainContent.querySelectorAll('img[alt], img[src]')
  imageElements.forEach(img => {
    const alt = img.getAttribute('alt')
    const src = img.getAttribute('src')
    if (alt) images.push(alt)
    else if (src) images.push(src)
  })

  return {
    title,
    text: cleanText.substring(0, 5000), // Limit to 5000 characters
    headings,
    links: links.slice(0, 10), // Limit to 10 links
    images: images.slice(0, 10) // Limit to 10 images
  }
}

export function getPageContentSummary(): string {
  const content = extractPageContent()
  
  return `
Page Title: ${content.title}

Main Headings:
${content.headings.map(h => `- ${h}`).join('\n')}

Key Content:
${content.text.substring(0, 2000)}

Relevant Links:
${content.links.slice(0, 5).map(l => `- ${l}`).join('\n')}
`.trim()
}
