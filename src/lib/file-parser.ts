// src/lib/file-parser.ts
'use client';

import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the workerSrc for pdfjs-dist. This is necessary for it to work in a browser environment.
// We are using a CDN for simplicity.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Extracts text from a given File object.
 * Supports PDF, DOCX, JSON, and plain text files.
 * @param file The File object to parse.
 * @returns A promise that resolves with the extracted text content.
 */
export async function extractTextFromFile(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
        return extractTextFromPdf(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        return extractTextFromDocx(file);
    } else if (file.type === 'application/json') {
        // For JSON, we just return the raw text. The caller will parse it.
        return file.text();
    } else if (file.type.startsWith('text/')) {
        return file.text();
    } else {
        throw new Error(`Unsupported file type: ${file.type}`);
    }
}

/**
 * Extracts text content from a PDF file.
 * @param file The PDF file.
 * @returns A promise that resolves to the text content of the PDF.
 */
async function extractTextFromPdf(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        
        if (pdf.numPages === 0) {
            throw new Error("The PDF file appears to be empty.");
        }

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            // IMPROVED: Add newlines between items if they are far apart vertically?
            // For now, simply joining with space is standard for RAG/LLM input.
            // But we can filter out empty strings.
            const pageText = content.items
                .map(item => ('str' in item ? item.str : ''))
                .filter(str => str.trim().length > 0)
                .join(' ');
            
            text += pageText;
            if (i < pdf.numPages) {
            text += '\n\n'; // Add page breaks
            }
        }
        
        return text;
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to parse PDF. Please ensure the file is not corrupted.");
    }
}

/**
 * Extracts raw text from a DOCX file.
 * @param file The DOCX file.
 * @returns A promise that resolves to the raw text content of the document.
 */
async function extractTextFromDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}