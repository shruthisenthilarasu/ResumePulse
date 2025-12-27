# ResumePulse: Resume Analytics & Signal Evaluation System

ResumePulse is a signal-based resume analytics assistant that analyzes observable signals in resumes and provides evidence-based, explainable feedback for technical roles.

## Overview

ResumePulse operates as a **signal interpreter**, not a holistic resume judge. It:
- Analyzes observable signals extracted from resumes
- Explains the screening implications of identified signals
- Suggests specific, evidence-based improvements

## System Design

This repository contains the system design for creating a Custom GPT on OpenAI's platform.

### Files

- **`CUSTOM_GPT_SYSTEM_PROMPT.md`**: Complete system instructions to paste into OpenAI's Custom GPT builder
- **`CUSTOM_GPT_SETUP_GUIDE.md`**: Step-by-step guide for setting up the Custom GPT
- **`README.md`**: This file

## Quick Start

1. Read `CUSTOM_GPT_SETUP_GUIDE.md` for detailed setup instructions
2. Copy the contents of `CUSTOM_GPT_SYSTEM_PROMPT.md` into your Custom GPT's Instructions field
3. Configure conversation starters and capabilities as described in the setup guide
4. Test and refine based on your needs

## Core Philosophy

### Signal-Based Evaluation
- Evaluation is **signal-based, not vibe-based**
- All feedback is **explainable, specific, and grounded in observable evidence**
- Uses qualifiers like "likely," "may indicate," "suggests" when inferring

### Conservative Interpretation
- Does not infer intent, personality, or potential beyond observable signals
- Does not invent achievements or exaggerate impact
- States uncertainty explicitly when uncertain
- Preserves factual integrity in all suggestions

### Explainability First
- Every finding traces back to specific evidence in the resume
- Explains **why** a signal matters, not just **that** it matters
- Provides context on screening implications

## Analysis Pipeline

1. **Text Normalization**: Reconstruct readable sections from raw text
2. **Structural Parsing**: Identify entries and extract bullet points
3. **Signal Extraction**: Analyze action verbs, quantification, impact categories, clarity
4. **Metric Computation**: Calculate quantification rates, impact distribution, clarity scores
5. **Interpretation & Findings**: Present structured analysis with evidence-based feedback

## Output Format

Each analysis includes:

1. **Overview**: High-level summary (2-3 sentences)
2. **Signal Analysis**:
   - Strong Signals (3-5 with evidence)
   - Weak or Missing Signals (3-5 with guidance)
   - Risk Flags (only if observable evidence exists)
3. **Targeted Suggestions**: 3-5 prioritized, actionable suggestions
4. **Example Rewrites**: Maximum 2 examples with placeholders

## Role-Aware Analysis

Optimized for technical roles:
- Software Engineer
- Data Scientist / Analyst
- Product Manager
- DevOps / SRE
- Research Engineer

Can analyze for general technical roles if no specific role is provided.

## Ethical Constraints

- Does not fabricate achievements or suggest inventing metrics
- Does not predict hiring outcomes
- Does not make definitive ATS claims without evidence
- Preserves factual integrity in all suggestions
- Respects candidate agency

## Limitations

ResumePulse cannot:
- Predict actual hiring decisions or ATS behavior with certainty
- Assess visual design, formatting, or aesthetic appeal
- Verify truthfulness of claims (assumes good faith)
- Provide role-specific advice for all industries
- Replace human judgment in hiring processes

## Version

**System Version**: 2.0  
**Last Updated**: 2025-12-27

## License

This system design is provided for creating Custom GPTs. Use responsibly and in accordance with OpenAI's usage policies.

## Support

For setup questions, refer to `CUSTOM_GPT_SETUP_GUIDE.md`. For system design questions, review `CUSTOM_GPT_SYSTEM_PROMPT.md`.

---

**Note**: This is a system design document for creating a Custom GPT. It does not include code implementation. For a code-based implementation, you would need to build a separate application using the principles outlined here.

