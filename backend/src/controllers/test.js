import { GoogleGenAI } from '@google/genai'

const MODEL = 'gemini-3.8-flash'
const MAX_PROMPT_LENGTH = 10000

export async function generateContent(req, res) {
    const { prompt } = req.body ?? {}
    if (typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ message: 'A prompt is required.' })
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
        return res.status(400).json({ message: `Prompts must be ${MAX_PROMPT_LENGTH} characters or fewer.` })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return res.status(503).json({ message: 'Gemini is not configured on the server.' })
    }

    try {
        const ai = new GoogleGenAI({ apiKey })
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt.trim(),
        })
        if (!response.text) {
            console.error('Gemini returned an empty response.')
            return res.status(502).json({ message: 'Gemini did not return generated text.' })
        }

        return res.status(200).json({ text: response.text })
    } catch (error) {
        console.error('Gemini content generation failed:', error)
        return res.status(502).json({ message: 'Unable to generate content right now.' })
    }
}
