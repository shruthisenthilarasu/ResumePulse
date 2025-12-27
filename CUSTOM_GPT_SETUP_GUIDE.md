# ResumePulse Custom GPT Setup Guide

This guide will help you create a Custom GPT on OpenAI's platform using the ResumePulse system design.

## Live Custom GPT

**Try ResumePulse**: [ResumePulse on ChatGPT](https://chatgpt.com/g/g-694f75c6d7e881918aedfd76c37a1a6f-resume-pulse)

The ResumePulse Custom GPT is already live and ready to use! You can try it out or use this guide to create your own version.

## Step 1: Access Custom GPT Builder

1. Go to [chat.openai.com](https://chat.openai.com)
2. Click on your profile → "My GPTs" or navigate to the GPT Builder
3. Click "Create" to start building a new Custom GPT

## Step 2: Configure Basic Settings

### Name
```
ResumePulse
```

### Description
```
A signal-based resume analytics assistant that analyzes observable signals in resumes and provides evidence-based, explainable feedback for technical roles.
```

### Instructions
Copy and paste the entire contents of `CUSTOM_GPT_SYSTEM_PROMPT.md` into the Instructions field.

## Step 3: Configure Conversation Starters

Add these conversation starters:

1. **"Analyze my resume for a Software Engineer role"**
   - Helps users get started quickly with a common use case

2. **"What signals should I emphasize for a Data Science role?"**
   - Guides users on role-specific optimization

3. **"Help me quantify my impact statements"**
   - Directs users to a key improvement area

4. **"Review my project section bullets"**
   - Allows focused analysis on specific sections

## Step 4: Configure Capabilities

Enable the following capabilities:

- ✅ **Web Browsing**: Not required (disable)
- ✅ **DALL·E Image Generation**: Not required (disable)
- ✅ **Code Interpreter**: Optional (enable if you want to add future features like PDF parsing)

## Step 5: Knowledge Base (Optional)

You can upload example resumes or reference documents to help the GPT understand:
- Example strong resumes (anonymized)
- Industry-specific terminology
- Common resume patterns

**Note**: Only upload if you have anonymized, consent-based examples.

## Step 6: Actions/Integrations (Optional)

Currently, ResumePulse doesn't require external API integrations. However, you could add:
- PDF parsing service (if Code Interpreter isn't sufficient)
- Resume storage/retrieval system
- Analytics tracking

For now, leave Actions empty.

## Step 7: Privacy & Safety

### Privacy Settings
- Set visibility to "Only me" (private) or "Anyone with a link" (shared)
- Review data usage policies

### Safety Guidelines
The system prompt already includes ethical constraints. Additionally:
- Ensure the GPT doesn't store or share resume content
- Remind users that analysis is for improvement purposes only

## Step 8: Testing

Test your Custom GPT with:

1. **Sample Resume Text** (paste a resume)
2. **With Target Role**: "Analyze this for a Software Engineer role"
3. **Without Target Role**: "Analyze this resume"
4. **Edge Cases**:
   - Very short resume
   - Poorly formatted text
   - Non-technical resume

### Expected Behavior
- ✅ Provides structured analysis (Overview, Strong Signals, Weak Signals, Suggestions)
- ✅ Uses evidence-based language
- ✅ Avoids motivational language
- ✅ Provides at most 2 example rewrites
- ✅ States uncertainty when appropriate

## Step 9: Refinement

Based on testing, you may want to:

1. **Adjust tone** if it's too formal/informal
2. **Add role-specific guidance** for your target audience
3. **Clarify instructions** if the GPT misinterprets certain signals
4. **Add example outputs** in the Knowledge base

## Step 10: Publishing

Once satisfied:

1. Click "Save" → Choose visibility
2. Share the link with users
3. Monitor feedback and iterate

## Customization Options

### For Different Audiences

**For Students/New Grads:**
- Emphasize project and coursework analysis
- Add guidance on academic experience translation

**For Career Changers:**
- Emphasize transferable skills identification
- Add guidance on non-technical to technical transition

**For Senior Engineers:**
- Emphasize leadership and architecture signals
- Add guidance on impact scaling

### For Different Industries

Modify the Role-Aware Analysis section to include:
- Finance/FinTech specific signals
- Healthcare Tech signals
- Gaming/Entertainment signals
- etc.

## Troubleshooting

### GPT is too verbose
- Add to instructions: "Keep responses concise. Maximum 1000 words per analysis."

### GPT invents metrics
- Strengthen the "Preserve factual integrity" section
- Add: "NEVER suggest specific numbers. Only use placeholders like [X users]."

### GPT provides too many rewrites
- Add: "Maximum 2 example rewrites per analysis. No exceptions."

### GPT comments on formatting
- Strengthen: "DO NOT comment on fonts, colors, spacing, margins, or visual design."

## Advanced: Multi-Modal Support

If you want to support PDF uploads directly:

1. Enable Code Interpreter
2. Add to instructions:
   ```
   If user uploads a PDF, extract text using available tools. Note that visual formatting is not available—only text content.
   ```
3. Test with sample PDFs

## Maintenance

### Regular Updates
- Review user feedback monthly
- Update signal taxonomy based on industry changes
- Refine role-specific guidance

### Version Control
- Keep a changelog of instruction updates
- Test thoroughly before deploying changes

## Support & Feedback

Consider adding to your GPT description:
- How to provide feedback
- Known limitations
- Best practices for using the tool

---

## Quick Reference: Key Instruction Sections

When updating your Custom GPT, focus on these critical sections:

1. **Core Philosophy** - Ensures consistent evaluation approach
2. **Analysis Pipeline** - Step-by-step process (Steps 1-5)
3. **Output Format** - Ensures structured, consistent responses
4. **Tone & Style Guidelines** - Maintains professional, neutral tone
5. **Ethical & Safety Constraints** - Prevents harmful outputs

---

**Version**: 2.0  
**Last Updated**: 2025-12-27

