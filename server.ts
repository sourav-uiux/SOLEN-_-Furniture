import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please select or configure an API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (/API_KEY_INVALID|PERMISSION_DENIED|not configured/i.test(raw)) {
    return {
      status: 403,
      message:
        'A valid Gemini API key with access to this model is required. Please check your key in Settings > Secrets.',
    };
  }
  if (/RESOURCE_EXHAUSTED|429|quota|billing/i.test(raw)) {
    return {
      status: 429,
      message:
        'Quota or billing limit reached for this paid model. Please select a billing-enabled API key in Settings > Secrets.',
    };
  }
  if (/NOT_FOUND|404/i.test(raw)) {
    return {
      status: 404,
      message: `Requested Gemini model was not found or is unavailable: ${raw}`,
    };
  }
  return {
    status: 500,
    message: raw || 'Failed to complete Gemini request.',
  };
}

const ALLOWED_IMAGE_RATIOS = new Set([
  '1:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '9:16',
  '16:9',
  '21:9',
]);

const ALLOWED_VIDEO_RATIOS = new Set(['16:9', '9:16']);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Image Generation via Gemini Interactions API (gemini-nano-banana-2.1)
  app.post('/api/gemini/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio = '16:9', quality = '1K' } = req.body ?? {};
      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'Please provide an architectural or product prompt.' });
      }
      if (!ALLOWED_IMAGE_RATIOS.has(aspectRatio)) {
        return res.status(400).json({ error: `Unsupported aspect ratio: ${aspectRatio}` });
      }

      const ai = getAiClient();
      const imageSize = quality === '2K' ? '2K' : '1K';

      const interaction = await ai.interactions.create({
        model: 'gemini-nano-banana-2.1',
        input: `Architectural interior and luxury furniture photography, quiet luxury editorial style, natural light, warm ivory plaster and European oak aesthetic: ${prompt.trim()}`,
        response_modalities: ['image', 'text'],
        generation_config: {
          image_config: {
            aspect_ratio: aspectRatio,
            image_size: imageSize,
          },
        },
      });

      let imageUrl: string | null = null;
      let caption = '';

      for (const step of interaction.steps ?? []) {
        if (step.type === 'model_output') {
          const img = step.content?.find((c) => c.type === 'image');
          if (img && img.data) {
            const mime = img.mime_type || 'image/png';
            imageUrl = `data:${mime};base64,${img.data}`;
          }
          const txt = step.content?.find((c) => c.type === 'text');
          if (txt && txt.text) {
            caption += txt.text;
          }
        }
      }

      if (!imageUrl && interaction.output_image?.data) {
        const mime = interaction.output_image.mime_type || 'image/png';
        imageUrl = `data:${mime};base64,${interaction.output_image.data}`;
      }

      if (!imageUrl) {
        return res.status(502).json({
          error: 'The model did not return an image. Please refine your prompt and try again.',
        });
      }

      return res.json({
        imageUrl,
        aspectRatio,
        caption: caption.trim() || null,
        interactionId: interaction.id,
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Photo-to-Video Animation via Gemini Interactions API (gemini-omni-1.2-flash)
  app.post('/api/gemini/animate-video', async (req, res) => {
    try {
      const {
        imageDataBase64,
        mimeType = 'image/jpeg',
        prompt = 'Slow architectural camera dolly inward through warm afternoon sunlight gently shifting across the furniture.',
        aspectRatio = '16:9',
        duration = '6s',
      } = req.body ?? {};

      if (!imageDataBase64 || typeof imageDataBase64 !== 'string') {
        return res.status(400).json({ error: 'Please upload or select a starting photograph.' });
      }
      if (!ALLOWED_VIDEO_RATIOS.has(aspectRatio)) {
        return res.status(400).json({ error: 'Video aspect ratio must be 16:9 or 9:16.' });
      }

      const cleanBase64 = imageDataBase64.replace(/^data:[^;]+;base64,/, '');
      const ai = getAiClient();

      const interaction = await ai.interactions.create(
        {
          model: 'gemini-omni-1.2-flash',
          input: [
            {
              type: 'image',
              mime_type: mimeType,
              data: cleanBase64,
            },
            {
              type: 'text',
              text: String(prompt).trim(),
            },
          ],
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: aspectRatio as '16:9' | '9:16',
            duration: String(duration),
            resolution: '720p',
          },
        },
        { timeout: 300000 }
      );

      const videoPart = interaction.output_video;
      if (!videoPart || (!videoPart.data && !videoPart.uri)) {
        return res.status(502).json({
          error: 'Video generation completed without a playable video payload.',
        });
      }

      if (videoPart.data) {
        const videoMime = videoPart.mime_type || 'video/mp4';
        return res.json({
          videoUrl: `data:${videoMime};base64,${videoPart.data}`,
          aspectRatio,
          mimeType: videoMime,
        });
      }

      return res.json({
        videoUrl: videoPart.uri,
        aspectRatio,
        mimeType: videoPart.mime_type || 'video/mp4',
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOLEN Atelier server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
