import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CUSTOM_GPT_ID = process.env.OPENAI_CUSTOM_GPT_ID || 'g-694f75c6d7e881918aedfd76c37a1a6f';

export interface AnalysisRequest {
  resumeText: string;
  targetRole?: string;
}

export interface AnalysisResponse {
  overview: string;
  strongSignals: Array<{
    type: string;
    evidence: string;
    whyItMatters: string;
  }>;
  weakSignals: Array<{
    gap: string;
    location: string;
    implication: string;
    guidance: string;
  }>;
  riskFlags: Array<{
    type: string;
    observation: string;
    evidence: string;
    note: string;
  }>;
  suggestions: Array<{
    priority: 'High' | 'Medium' | 'Low';
    suggestion: string;
    focus: string;
    impact: string;
  }>;
  exampleRewrites: Array<{
    original: string;
    revised: string;
    changes: string[];
    note: string;
  }>;
  metrics?: {
    quantificationRate?: number;
    clarityScore?: number;
    impactDistribution?: Record<string, number>;
  };
}

export class OpenAIService {
  async analyzeResume(request: AnalysisRequest): Promise<AnalysisResponse> {
    const { resumeText, targetRole } = request;

    const systemPrompt = `You are ResumePulse, a signal-based resume analytics assistant. Analyze the provided resume text and provide structured feedback following the exact output format.`;

    const userPrompt = this.buildAnalysisPrompt(resumeText, targetRole);

    try {
      // Use the Assistants API to interact with the Custom GPT
      // Note: Custom GPTs are accessed via the chat completions API with specific instructions
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt + this.getResumePulseInstructions(),
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const parsed = JSON.parse(content);
      return this.validateAndFormatResponse(parsed);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze resume with AI service');
    }
  }

  private buildAnalysisPrompt(resumeText: string, targetRole?: string): string {
    let prompt = `Analyze the following resume text and provide a comprehensive signal-based analysis.\n\n`;
    
    if (targetRole) {
      prompt += `Target Role: ${targetRole}\n\n`;
    } else {
      prompt += `Analyze for general technical roles.\n\n`;
    }

    prompt += `Resume Text:\n${resumeText}\n\n`;
    prompt += `Provide your analysis in the following JSON format:\n`;
    prompt += JSON.stringify({
      overview: "2-3 sentence summary",
      strongSignals: [{
        type: "Signal type",
        evidence: "Exact quote from resume",
        whyItMatters: "Screening implication"
      }],
      weakSignals: [{
        gap: "What signal is missing",
        location: "Where observed",
        implication: "Screening impact",
        guidance: "Specific direction"
      }],
      riskFlags: [],
      suggestions: [{
        priority: "High|Medium|Low",
        suggestion: "Actionable suggestion",
        focus: "Where to apply",
        impact: "Expected improvement"
      }],
      exampleRewrites: [{
        original: "Original bullet",
        revised: "Revised example",
        changes: ["Change 1", "Change 2"],
        note: "Note about placeholders"
      }]
    }, null, 2);

    return prompt;
  }

  private getResumePulseInstructions(): string {
    return `
    
You are ResumePulse, a signal-based resume analytics assistant.

Core Principles:
- Evaluation is signal-based, not vibe-based
- All feedback must be explainable, specific, and grounded in observable evidence
- Use qualifiers like "likely," "suggests," "may indicate" when inferring
- Do not invent achievements or exaggerate impact
- Preserve factual integrity in all suggestions

Analysis Pipeline:
1. Text Normalization: Identify sections (Experience, Projects, Skills, Education)
2. Structural Parsing: Extract entries and bullet points
3. Signal Extraction: Analyze action verbs, quantification, impact categories, clarity
4. Metric Computation: Calculate quantification rates, impact distribution, clarity scores
5. Interpretation: Generate structured findings

Output Requirements:
- Overview: 2-3 sentence summary
- Strong Signals: 3-5 specific signals with evidence
- Weak Signals: 3-5 signal gaps with guidance
- Risk Flags: Only if observable evidence exists
- Suggestions: 3-5 prioritized, actionable suggestions
- Example Rewrites: Maximum 2 examples with placeholders

Tone: Analytical, neutral, precise, constructive. No emojis, no motivational language.
`;
  }

  private validateAndFormatResponse(parsed: any): AnalysisResponse {
    // Ensure all required fields exist
    return {
      overview: parsed.overview || 'Analysis completed.',
      strongSignals: parsed.strongSignals || [],
      weakSignals: parsed.weakSignals || [],
      riskFlags: parsed.riskFlags || [],
      suggestions: parsed.suggestions || [],
      exampleRewrites: (parsed.exampleRewrites || []).slice(0, 2), // Max 2
      metrics: parsed.metrics,
    };
  }
}

