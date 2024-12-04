import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory
} from '../node_modules/@google/generative-ai/dist/index.mjs';

const MAX_MODEL_CHARS = 4000;

let genAI = null;
let model = null;
const apiKey = 'AIzaSyCSS2sSqYfCIAK8sL9O5MXA6GI3eWf_D9o'
export function initModel(generationConfig) {
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
    generationConfig,
  });
}

export async function runPrompt(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Prompt execution failed", error);
    throw error;
  }
}

export async function executePrompt(prompt) {
    try {
        const generationConfig = {
          temperature: "1"
        };
        initModel(generationConfig);
        const response = await runPrompt(prompt, generationConfig);
        return response
        
      } catch (e) {
        console.log(e)
      }
}
export async function generateSummary(text, type, length= "medium") {
  if (!window.ai || !window.ai.summarizer) {
    throw new Error("AI Summarization is not supported in this browser.");
  }

  if (text.length > MAX_MODEL_CHARS) {
    throw new Error(
      `Text exceeds the maximum supported length of ${MAX_MODEL_CHARS} characters.`
    );
  }

  const session = await window.ai.summarizer.create({
    type: type,
    format: "markdown",
    length: length,
  });

  const summary = await session.summarize(text);
  session.destroy();
  return summary;
}
