import { GoogleGenAI, Modality, GenerateContentResponse, Chat } from '@google/genai';
import { ProcessingMode } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getUpscalePrompt = (resolution: string): string => {
    return `Upscale this image to ${resolution} resolution (longest side). Enhance details and sharpness as you upscale, but crucially, preserve the original identity and all facial features of any subjects. Do not invent new details. The result should be a larger, clearer version of the original photo. Output only the upscaled image.`;
};


const getPromptForMode = (mode: ProcessingMode): string => {
  switch (mode) {
    case ProcessingMode.ENHANCE:
      return "Enhance this photo by improving clarity, sharpness, and color balance, and reducing noise. **Crucially, you must not alter any facial features or the identity of people in the photo.** The goal is a clearer, restored version of the original. Output only the enhanced image.";
    case ProcessingMode.UPSCALE_2K:
      return getUpscalePrompt('2K (2048px)');
    case ProcessingMode.UPSCALE_4K:
      return getUpscalePrompt('4K (3840px)');
    case ProcessingMode.UPSCALE_8K:
      return getUpscalePrompt('8K (7680px)');
    case ProcessingMode.REMOVE_BG:
      return 'Identify the most prominent subject in this photo. Create a new image where this subject is perfectly preserved, but the entire background is removed and replaced with transparency. Output only the resulting PNG image.';
    case ProcessingMode.REMOVE_WATERMARK:
        return "Analyze the image for any overlaid graphical elements, logos, or text that are not part of the original scene. Use content-aware fill to remove these elements and realistically reconstruct the underlying image. Output only the cleaned image.";
    case ProcessingMode.CARTOON:
      return 'Convert this photo into a high-quality, modern 3D cartoon style, similar to what you\'d see in a major animation studio film. Emphasize expressive features, vibrant and saturated colors, and clean, bold outlines. The final result should have a polished, slightly exaggerated, and charming animated look while perfectly preserving the subject\'s identity. Output only the cartoonified image.';
    case ProcessingMode.ANIME:
      return 'Convert this image into a beautiful anime art style, with characteristic large eyes, detailed hair, and soft coloring. Output only the anime-styled image.';
    case ProcessingMode.SKETCH:
      return 'Turn this image into a detailed, realistic pencil sketch, as if drawn by an artist. It should be black and white. Output only the sketch image.';
    case ProcessingMode.FANTASY:
      return 'Re-render this image in a high-fantasy art style, with epic lighting, magical elements, and an ethereal quality. Output only the fantasy-style image.';
    case ProcessingMode.CUSTOM_AI_EDIT:
      return 'Apply the user-defined edit to this image.'; // This is a fallback, custom prompt should be provided
    default:
      throw new Error('Invalid processing mode');
  }
};

export const createChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are an AI image editing assistant. Your goal is to help the user create a perfect text prompt to modify their image. Converse with them to understand their needs. When you have a clear instruction, provide ONLY the final prompt text itself, enclosed in a special block like this: [PROMPT]Your final prompt here[/PROMPT]. Do not add any other text before or after the block in that final message. For example, a final message should look exactly like: [PROMPT]Make the cat wear a tiny wizard hat and a monocle[/PROMPT]',
    },
  });
};

export const processImage = async (
  base64Image: string,
  mimeType: string,
  mode: ProcessingMode,
  customPrompt?: string,
): Promise<string> => {
  const prompt = customPrompt ?? getPromptForMode(mode);
  
  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [];

  // Always add the original image first
  parts.push({
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  });
  
  // Add the text prompt last
  parts.push({ text: prompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Safely check if the response has valid content before accessing it.
    // This prevents crashes when the API blocks a request due to safety filters.
    if (!response.candidates?.length || !response.candidates[0].content?.parts?.length) {
      const reason = response.promptFeedback?.blockReason || 'No content';
      const message = response.promptFeedback?.blockReasonMessage || 'The AI returned an empty response, possibly due to safety filters or an unsupported prompt.';
      throw new Error(`Processing failed. Reason: ${reason}. ${message}`);
    }

    const responseTextParts: string[] = [];
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data; // Success
      }
      if (part.text) {
        responseTextParts.push(part.text);
      }
    }

    // If we are here, no image was found.
    if (responseTextParts.length > 0) {
      // The model probably explained why it failed.
      const reason = responseTextParts.join(' ').trim();
      throw new Error(`AI failed to return an image. Reason: "${reason}"`);
    }

    throw new Error('No image was returned from the API and no reason was provided.');
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error instanceof Error) {
        throw error; // Re-throw the specific error from the try block or the API call itself.
    }
    throw new Error('Failed to process image with AI. Please check the console for details.');
  }
};