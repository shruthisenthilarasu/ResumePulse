import pdf from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

export interface ExtractionResult {
  text: string;
  normalizedText: string;
  sections: {
    experience: string[];
    projects: string[];
    skills: string[];
    education: string[];
    other: string[];
  };
  extractionQuality: 'GOOD' | 'LIMITED' | 'POOR';
}

const SECTION_PATTERNS = {
  experience: [
    /^(experience|work experience|professional experience|employment)/i,
    /^(work history|career)/i,
  ],
  projects: [
    /^(projects?|personal projects?|academic projects?)/i,
    /^(portfolio|side projects)/i,
  ],
  skills: [
    /^(skills?|technical skills?|core competencies)/i,
    /^(technologies|tools)/i,
  ],
  education: [
    /^(education|academic background|academic)/i,
    /^(qualifications)/i,
  ],
};

export class PDFProcessor {
  async extractText(filePath: string): Promise<ExtractionResult> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);

      const rawText = data.text;
      const normalizedText = this.normalizeText(rawText);
      const sections = this.parseSections(normalizedText);
      const quality = this.assessQuality(normalizedText);

      return {
        text: rawText,
        normalizedText,
        sections,
        extractionQuality: quality,
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private normalizeText(text: string): string {
    // Merge broken lines
    let normalized = text.replace(/\r\n/g, '\n');
    normalized = normalized.replace(/\r/g, '\n');
    
    // Merge lines that don't end with punctuation and are short
    const lines = normalized.split('\n');
    const merged: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check if line should be merged with next
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (
          line.length < 80 &&
          !line.match(/[.!?•\-*]$/) &&
          nextLine &&
          !nextLine[0].match(/[A-Z]/)
        ) {
          merged.push(line + ' ' + nextLine);
          i++; // Skip next line
          continue;
        }
      }
      
      merged.push(line);
    }
    
    return merged.join('\n');
  }

  private parseSections(text: string): ExtractionResult['sections'] {
    const sections: ExtractionResult['sections'] = {
      experience: [],
      projects: [],
      skills: [],
      education: [],
      other: [],
    };

    const lines = text.split('\n');
    let currentSection: keyof typeof sections | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if this is a section header
      let isHeader = false;
      for (const [section, patterns] of Object.entries(SECTION_PATTERNS)) {
        for (const pattern of patterns) {
          if (pattern.test(trimmed)) {
            currentSection = section as keyof typeof sections;
            isHeader = true;
            break;
          }
        }
        if (isHeader) break;
      }

      if (!isHeader && currentSection) {
        sections[currentSection].push(trimmed);
      } else if (!isHeader && !currentSection) {
        sections.other.push(trimmed);
      }
    }

    return sections;
  }

  private assessQuality(text: string): 'GOOD' | 'LIMITED' | 'POOR' {
    if (text.length < 100) return 'POOR';
    if (text.length < 500) return 'LIMITED';
    
    // Check for excessive whitespace or strange characters
    const artifactCount = (text.match(/\s{3,}/g) || []).length;
    if (artifactCount > text.length / 20) return 'POOR';
    
    return 'GOOD';
  }
}

