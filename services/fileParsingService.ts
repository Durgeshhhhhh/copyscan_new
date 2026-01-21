
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Set worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

export const parseFileToText = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    switch (extension) {
      case 'pdf':
        return await extractTextFromPDF(file);
      case 'docx':
        return await extractTextFromDOCX(file);
      case 'pptx':
      case 'ppt':
        return await extractTextFromPPTX(file);
      case 'html':
      case 'htm':
        return await extractTextFromHTML(file);
      case 'txt':
      case 'md':
      case 'rtf':
        return await extractTextFromFileReader(file);
      default:
        // Try simple text reader for unknown formats
        return await extractTextFromFileReader(file);
    }
  } catch (error) {
    console.error(`Error parsing ${extension} file:`, error);
    throw new Error(`Failed to read the contents of this ${extension?.toUpperCase()} file.`);
  }
};

const extractTextFromFileReader = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || "");
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + "\n\n";
  }

  return fullText.trim();
};

const extractTextFromDOCX = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
};

const extractTextFromHTML = async (file: File): Promise<string> => {
  const htmlContent = await extractTextFromFileReader(file);
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Remove scripts and styles
  const scripts = doc.querySelectorAll('script, style');
  scripts.forEach(s => s.remove());
  
  return doc.body.innerText || doc.body.textContent || "";
};

const extractTextFromPPTX = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  let fullText = "";
  const parser = new DOMParser();

  // 1. Extract Slides
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  );
  
  // Sort slide files numerically using the requested logic
  slideFiles.sort((a, b) => {
    const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
    const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
    return aNum - bNum;
  });

  for (const slidePath of slideFiles) {
    const content = await zip.file(slidePath)?.async('string');
    if (content) {
      const xmlDoc = parser.parseFromString(content, 'application/xml');
      const textNodes = xmlDoc.getElementsByTagName('a:t');
      const slideText = Array.from(textNodes).map(node => node.textContent).join(' ');
      if (slideText.trim()) {
        fullText += slideText + "\n\n";
      }
    }
  }

  // 2. Extract Speaker Notes
  const notesFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/notesSlides/notesSlide') && name.endsWith('.xml')
  );

  notesFiles.sort((a, b) => {
    const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
    const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
    return aNum - bNum;
  });

  for (const notesPath of notesFiles) {
    const content = await zip.file(notesPath)?.async('string');
    if (content) {
      const xmlDoc = parser.parseFromString(content, 'application/xml');
      const textNodes = xmlDoc.getElementsByTagName('a:t');
      const notesText = Array.from(textNodes).map(node => node.textContent).join(' ');
      if (notesText.trim()) {
        fullText += "\n[Speaker Note]: " + notesText + "\n";
      }
    }
  }

  // 3. Extract Diagrams / SmartArt
  const diagramFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/diagrams/data') && name.endsWith('.xml')
  );

  for (const diagPath of diagramFiles) {
    const content = await zip.file(diagPath)?.async('string');
    if (content) {
      const xmlDoc = parser.parseFromString(content, 'application/xml');
      const textNodes = xmlDoc.getElementsByTagName('a:t');
      const diagText = Array.from(textNodes).map(node => node.textContent).join(' ');
      if (diagText.trim()) {
        fullText += "\n[Diagram Text]: " + diagText + "\n";
      }
    }
  }

  return fullText.trim();
};
