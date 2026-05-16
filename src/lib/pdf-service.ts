import { jsPDF } from 'jspdf'

export const pdfService = {
  generateStatutoryPDF: (title: string, content: string, companyName: string) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // --- 1. Legal Margins (Red & Blue Lines) ---
    doc.setDrawColor(220, 38, 38) // Red line
    doc.setLineWidth(0.5)
    doc.line(15, 0, 15, pageHeight)
    
    doc.setDrawColor(37, 99, 235) // Blue line
    doc.setLineWidth(0.2)
    doc.line(17, 0, 17, pageHeight)
    
    // --- 2. Watermark ---
    doc.setTextColor(245, 245, 245)
    doc.setFontSize(60)
    doc.setFont('helvetica', 'bold')
    doc.saveGraphicsState()
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }))
    doc.text('AGENTIC COMPLIANCE', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
    })
    doc.restoreGraphicsState()

    // --- 3. Header Section (Cleaner) ---
    doc.setDrawColor(226, 232, 240)
    doc.line(25, 15, pageWidth - 25, 15)

    // --- 4. Company Header (Letterhead Style) ---
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(16)
    doc.setFont('times', 'bold')
    doc.text(companyName.toUpperCase(), pageWidth / 2, 25, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('times', 'bold')
    doc.text(title.toUpperCase(), pageWidth / 2, 35, { align: 'center' })
    
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.6)
    doc.line( pageWidth / 2 - 40, 38, pageWidth / 2 + 40, 38)

    // --- 5. Content (Premium Typography) ---
    doc.setFontSize(11)
    doc.setFont('times', 'normal')
    doc.setTextColor(0, 0, 0)
    
    const margin = 25
    const splitText = doc.splitTextToSize(content, pageWidth - (margin * 2))
    doc.text(splitText, margin, 50, { lineHeightFactor: 1.4 })
    
    // --- 6. Signature Area (Conditional) ---
    const finalY = doc.getTextDimensions(splitText).h + 60
    if (finalY < pageHeight - 40) {
        // We will handle signature inside the content for more control, 
        // but adding a subtle line at the very bottom if needed
    }

    // --- 7. Footer ---
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(`Digitally Generated via Agentic Compliance OS | Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    }
    
    doc.save(`${title.replace(/\s+/g, '_')}_Draft.pdf`)
  }
}
