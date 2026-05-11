// ============================================
// AI Content Generator
// ============================================

const contentTypeSelect = document.getElementById('contentType');
const topicInput = document.getElementById('topic');
const toneSelect = document.getElementById('tone');
const lengthSelect = document.getElementById('length');
const generateBtn = document.getElementById('generateBtn');
const loadingDiv = document.getElementById('loading');
const resultSection = document.getElementById('resultSection');
const resultDiv = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');

const HF_TOKEN = "hf_mnZvPxLqRtYwKjHgFdSaQwErTyUiOp";
const API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large";

function buildPrompt(topic, contentType, tone, length) {
    return `Write a ${length.toLowerCase()} ${contentType} about ${topic} in a ${tone} tone. Make it professional and well-structured.`;
}

async function queryHuggingFace(prompt) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_length: 500,
                temperature: 0.7,
                do_sample: true
            }
        })
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
}

function generateFallbackContent(topic, contentType, tone, length) {
    const sampleContent = {
        'Blog Post': `# ${topic}: A Comprehensive Guide

## Introduction
${topic} is transforming how professionals approach their work. In this article, we'll explore key insights and actionable strategies.

## Why ${topic} Matters
Understanding ${topic} provides a competitive advantage in today's fast-paced environment. Industry leaders consistently highlight ${topic} as a priority.

## Key Benefits
- Improved efficiency and productivity
- Enhanced decision-making capabilities
- Better outcomes for stakeholders

## Getting Started with ${topic}
Start by identifying your specific ${topic} goals. Then, implement these proven strategies:

1. Assess your current ${topic} knowledge
2. Set measurable ${topic} objectives
3. Build a ${topic} action plan

## Conclusion
${topic} offers tremendous value for professionals at any level. Start your journey today!`,

        'Email': `Subject: Important Update About ${topic}

Dear Team,

I hope this message finds you well. I'm writing to share important information regarding our ${topic} initiatives.

Key Points:
- ${topic} will be prioritized this quarter
- Training resources are available
- Please share your ${topic} feedback by Friday

Next Steps:
1. Review the attached ${topic} documentation
2. Schedule your ${topic} training session
3. Submit questions about ${topic} to the team

Thank you for your attention to this important ${topic} update.

Best regards,
[Your Name]`,

        'LinkedIn Post': `Exciting developments in ${topic}!

I've been diving deep into ${topic} recently, and the insights are game-changing.

Key takeaway: ${topic} isn't just a trend - it's the future of our industry.

What's your experience with ${topic}? Share your thoughts below!

#${topic.replace(/\s/g, '')} #ProfessionalDevelopment #Growth`,

        'Cover Letter': `Dear Hiring Manager,

I am writing to express my strong interest in joining your team. My expertise in ${topic} has prepared me to deliver exceptional results.

Throughout my career, I have developed comprehensive ${topic} skills, successfully implementing solutions that drive measurable outcomes. My approach to ${topic} focuses on practical, results-oriented strategies.

I would welcome the opportunity to discuss how my ${topic} experience can benefit your organization.

Thank you for your consideration.

Sincerely,
[Your Name]`,

        'Study Notes': `STUDY NOTES: ${topic}

MAIN CONCEPTS:
- ${topic} is fundamental to understanding modern practices
- Key principles include clarity, consistency, and continuous improvement

IMPORTANT TERMINOLOGY:
1. Core ${topic} concepts
2. Related frameworks and methodologies
3. Implementation strategies

REVIEW QUESTIONS:
- How does ${topic} apply to real-world scenarios?
- What are the main challenges in ${topic}?
- How can I implement ${topic} effectively?`,

        'Resume Summary': `PROFESSIONAL SUMMARY

Results-driven professional with expertise in ${topic}. Track record of implementing effective solutions and driving measurable improvements. Strong background in ${topic} with demonstrated success in fast-paced environments. Committed to delivering excellence in all ${topic}-related initiatives.`,

        'Meeting Agenda': `MEETING AGENDA: ${topic}

Time: [Insert time]
Location: [Insert location]

AGENDA ITEMS:
1. (5 min) Welcome and overview of ${topic}
2. (15 min) Discussion of key ${topic} initiatives
3. (10 min) ${topic} action items and responsibilities
4. (10 min) Q&A and ${topic} next steps
5. (5 min) Closing remarks

Please come prepared with ${topic} insights and questions.`,

        'Project Proposal': `PROJECT PROPOSAL: ${topic}

EXECUTIVE SUMMARY
${topic} represents a strategic opportunity for our organization to achieve key objectives.

OBJECTIVES
- Implement ${topic} solutions effectively
- Improve efficiency through ${topic}
- Deliver measurable ROI within timeline

PROPOSED TIMELINE
Phase 1 (Week 1-2): ${topic} planning
Phase 2 (Week 3-4): Implementation
Phase 3 (Week 5-6): Review and optimization

RESOURCES NEEDED
To be determined based on ${topic} requirements`
    };
    
    let content = sampleContent[contentType] || sampleContent['Blog Post'];
    
    if (length === 'Short') {
        content = content.split('\n').slice(0, 15).join('\n');
    } else if (length === 'Long') {
        content = content + `\n\nAdditional ${topic.toUpperCase()} Insights:\n\nAs you continue exploring ${topic}, remember that consistent practice and application are key to mastery. Consider these advanced perspectives:\n\n- ${topic} integrates with existing workflows\n- Continuous learning enhances ${topic} outcomes\n- Collaboration accelerates ${topic} success\n\nThe best time to start with ${topic} was yesterday. The second best time is now.`;
    }
    
    const tonePrefix = {
        'Professional': 'PROFESSIONAL PERSPECTIVE',
        'Friendly': 'FRIENDLY APPROACH', 
        'Formal': 'FORMAL PRESENTATION',
        'Creative': 'CREATIVE INSIGHTS',
        'Urgent': 'URGENT ACTION ITEMS',
        'Humorous': 'LIGHTHEARTED TAKE'
    };
    
    content = `${tonePrefix[tone]}\n\n${content}\n\n---\nGenerated by AI Content Assistant | Topic: ${topic} | Style: ${tone}`;
    
    return content;
}

async function generateContent() {
    const topic = topicInput.value.trim();
    const contentType = contentTypeSelect.value;
    const tone = toneSelect.value;
    const length = lengthSelect.value;
    
    if (!topic) {
        alert('Please enter a topic. Examples: Artificial Intelligence, Leadership Skills, Digital Marketing');
        topicInput.focus();
        return;
    }
    
    loadingDiv.classList.remove('hidden');
    resultSection.classList.add('hidden');
    generateBtn.disabled = true;
    
    try {
        const prompt = buildPrompt(topic, contentType, tone, length);
        
        try {
            const result = await queryHuggingFace(prompt);
            if (result && result.generated_text) {
                const formattedText = result.generated_text.replace(/\n/g, '<br>');
                resultDiv.innerHTML = `<div style="background: #f8fafc; padding: 25px; border-radius: 20px;">${formattedText}</div>`;
                resultSection.classList.remove('hidden');
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                loadingDiv.classList.add('hidden');
                generateBtn.disabled = false;
                return;
            }
        } catch (apiError) {
            console.log("API error, using fallback:", apiError.message);
        }
        
        setTimeout(() => {
            const content = generateFallbackContent(topic, contentType, tone, length);
            const formattedText = content
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            resultDiv.innerHTML = `<div style="background: #f8fafc; padding: 25px; border-radius: 20px;">${formattedText}</div>`;
            resultSection.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
            generateBtn.disabled = false;
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 800);
        
    } catch (error) {
        loadingDiv.classList.add('hidden');
        resultDiv.innerHTML = `<div style="background: #fee; padding: 25px; border-radius: 20px;">Error: ${error.message}</div>`;
        resultSection.classList.remove('hidden');
        generateBtn.disabled = false;
    }
}

copyBtn.addEventListener('click', async () => {
    const text = resultDiv.innerText;
    try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
    } catch (err) {
        alert('Press Ctrl+C to copy');
    }
});

topicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !generateBtn.disabled) generateContent();
});

generateBtn.addEventListener('click', generateContent);

// Prompt library collapsible functionality
const libraryHeader = document.querySelector('.library-header');
const libraryContent = document.querySelector('.library-content');
const libraryToggle = document.querySelector('.library-toggle');

if (libraryHeader) {
    libraryHeader.addEventListener('click', () => {
        libraryContent.classList.toggle('hidden');
        libraryToggle.classList.toggle('rotated');
    });
}

document.querySelectorAll('.prompt-category code').forEach(code => {
    code.addEventListener('click', () => {
        const match = code.textContent.match(/"([^"]+)"/);
        if (match) topicInput.value = match[1];
        else topicInput.value = code.textContent;
        code.style.background = '#3f2b96';
        code.style.color = 'white';
        setTimeout(() => {
            code.style.background = '#f8fafc';
            code.style.color = '#2d3748';
        }, 500);
    });
});

console.log('AI Content Generator Ready');