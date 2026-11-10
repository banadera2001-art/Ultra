import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { evaluatePronunciationStrict, normalizeFilipinoTranscript } from './src/utils/pronunciationValidator';

/**
 * Convert 24kHz 16-bit Mono PCM buffer to Standard WAV Data URL
 */
function pcmToWav(pcmBase64: string, sampleRate = 24000, numChannels = 1): string {
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const wavHeader = Buffer.alloc(44);
  const dataLen = pcmBuffer.length;
  const fileLen = 36 + dataLen;

  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(fileLen, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20); // PCM format
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(sampleRate * numChannels * 2, 28);
  wavHeader.writeUInt16LE(numChannels * 2, 32);
  wavHeader.writeUInt16LE(16, 34); // 16-bit
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(dataLen, 40);

  const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);
  return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cache for generated high-quality TTS audio
  const ttsCache = new Map<string, string>();

  // Middleware for parsing JSON bodies with high limit for canvas base64 images
  app.use(express.json({ limit: '20mb' }));

  // Environment keys
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Supported fast and multimodal Gemini models per guidelines
  const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  const ai = geminiApiKey
    ? new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Helper to execute Gemini generation across available models with 12s timeout for vision
  async function callGeminiJson(contents: any): Promise<any | null> {
    if (!ai) return null;
    for (const modelName of GEMINI_MODELS) {
      try {
        const callPromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 12000)
        );

        const response: any = await Promise.race([callPromise, timeoutPromise]);
        if (response && response.text) {
          const parsed = JSON.parse(response.text.trim());
          return parsed;
        }
      } catch (err: any) {
        console.warn(`[Gemini] model ${modelName} call failed:`, err?.message || err);
      }
    }
    return null;
  }

  // Groq API Key and ultra-fast inference client for Blox Fruits non-repeating curriculum questions
  const groqApiKey = process.env.GROQ_API_KEY || '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';
  const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];

  async function callGroqJson(messages: Array<{ role: string; content: string }>, timeoutMs = 8000): Promise<any | null> {
    if (!groqApiKey) return null;
    for (const model of GROQ_MODELS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            response_format: { type: 'json_object' },
            temperature: 0.85,
          }),
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            let cleaned = content.trim();
            if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
            else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
            const parsed = JSON.parse(cleaned.trim());
            return parsed;
          }
        } else {
          const errText = await res.text();
          console.warn(`[Groq AI] Model ${model} returned status ${res.status}:`, errText);
        }
      } catch (err: any) {
        console.warn(`[Groq AI] Model ${model} call failed:`, err?.message || err);
      }
    }
    return null;
  }

  // Helper to normalize text for natural Tagalog TTS pronunciation
  // Prevents 2-letter syllables (like MA, BA, SA, TA) from being treated as acronyms (which spells them out as "M at A" / "Em-Ey")
  function normalizeTagalogTtsText(rawText: string): string {
    if (!rawText) return '';
    let text = rawText.trim();

    // 1. Isolated 2-letter word or with trailing punctuation:
    // Convert to lowercase so Google TTS & speech synthesis treat it as a syllable (pantig), not an acronym (e.g. "MA" -> "ma")
    if (/^[A-Za-z]{2}[.!?]?$/.test(text)) {
      return text.toLowerCase();
    }

    // 2. In phrases and sentences:
    // Convert "letrang [2-letter]" to "pantig na [lowercase 2-letter]"
    text = text.replace(/\bletrang\s+([A-Za-z]{2})\b/gi, (_, syl) => `pantig na ${syl.toLowerCase()}`);

    // Convert quoted 2-letter words e.g. "MA" or 'BA' to lowercase "ma", 'ba'
    text = text.replace(/(["'])([A-Za-z]{2})\1/g, (_, quote, syl) => `${quote}${syl.toLowerCase()}${quote}`);

    // Convert isolated uppercase 2-letter words surrounded by word boundaries to lowercase
    text = text.replace(/\b([A-Z]{2})\b/g, (match) => match.toLowerCase());

    return text;
  }

  // --- Health Check ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // --- API ROUTE: Free, Unlimited & Fluent Tagalog Text-to-Speech (TTS) ---
  app.post('/api/ai/tts', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing text parameter' });
      }

      const trimmedText = text.trim();
      const speechText = normalizeTagalogTtsText(trimmedText);
      const cacheKey = speechText.toLowerCase();

      // 1. Return immediately from server memory cache if available
      if (ttsCache.has(cacheKey)) {
        return res.json({ audioUrl: ttsCache.get(cacheKey) });
      }

      // 2. High-Fidelity, Free & Unlimited Native Tagalog TTS (Filipino Neural Voice)
      try {
        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=tl&q=${encodeURIComponent(speechText)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);
        const googleRes = await fetch(googleTtsUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://translate.google.com/',
          },
        });
        clearTimeout(timeoutId);

        if (googleRes.ok) {
          const arrayBuf = await googleRes.arrayBuffer();
          const base64Mp3 = Buffer.from(arrayBuf).toString('base64');
          const audioUrl = `data:audio/mp3;base64,${base64Mp3}`;

          // Keep bounded LRU cache
          if (ttsCache.size > 500) {
            const firstKey = ttsCache.keys().next().value;
            if (firstKey) ttsCache.delete(firstKey);
          }
          ttsCache.set(cacheKey, audioUrl);
          return res.json({ audioUrl });
        }
      } catch (googleErr) {
        // Fall through to browser Web Speech API
      }

      // 3. Return null immediately so client uses browser Web Speech synthesis with zero latency
      return res.json({ audioUrl: null });
    } catch (err) {
      console.error('TTS endpoint error:', err);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  });

  // --- API ROUTE 1: Evaluate Reading ---
  app.post('/api/ai/evaluate-reading', async (req, res) => {
    try {
      const { targetText, spokenTranscript, category } = req.body;

      if (!targetText) {
        return res.status(400).json({ error: 'Missing targetText parameter' });
      }

      // Step 1: Normalize transcript for Filipino phonology and E/I, O/U vowel sensitivity
      const normalizedSpoken = normalizeFilipinoTranscript(
        String(spokenTranscript || ''),
        String(targetText)
      );

      // Step 2: Run strict deterministic phonetics validator
      const strictResult = evaluatePronunciationStrict(
        String(targetText),
        normalizedSpoken,
        category || 'word'
      );

      // Return strict phonetic result immediately in under 1ms for BOTH correct and wrong answers!
      // This eliminates the 30-second delay for wrong answers and avoids Gemini quota errors completely.
      return res.json({
        isCorrect: strictResult.isCorrect,
        score: strictResult.score,
        transcription: spokenTranscript || '(walang narinig)',
        normalizedSpoken: strictResult.normalizedSpoken || targetText,
        feedbackTagalog: strictResult.feedbackTagalog,
        correctionTips: strictResult.correctionTips,
      });
    } catch (err) {
      console.error('Reading API Error:', err);
      res.status(500).json({ error: 'Internal server error evaluating reading' });
    }
  });

  // --- API ROUTE 2: Evaluate Writing ---
  app.post('/api/ai/evaluate-writing', async (req, res) => {
    try {
      const { imageBase64, targetText, guideType, strokeData } = req.body;

      if (!imageBase64 || !targetText) {
        return res.status(400).json({ error: 'Missing imageBase64 or targetText' });
      }

      // Fast check: if stroke data indicates empty or negligible stroke (< 50 pixels)
      const pixelCount = strokeData?.pixelCount ?? 200;
      const strokeCount = strokeData?.strokeCount ?? 1;

      if (pixelCount < 50 || strokeCount === 0) {
        return res.json({
          isCorrect: false,
          score: 1,
          feedbackTagalog: `Wala ka pang naisusulat sa canvas. Gamitin ang mouse upang isulat ang "${targetText}".`,
          correctionTips: [
            'Gamitin ang mouse upang sundan ang hugis ng letra sa pagitan ng mga linya bago pindutin ang Isubmit.',
            'Siguraduhing malinaw ang bawat guhit.',
          ],
          detailedAnalysis: {
            alignmentScore: 1,
            sizingScore: 1,
            legibilityScore: 1,
          },
        });
      }

      // Extract raw base64 data
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      // Attempt fast Gemini vision evaluation
      if (ai) {
        try {
          const imagePart = {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          };

          const promptPart = {
            text: `
You are a warm, supportive Grade 1 Elementary Teacher in the Philippines evaluating a 6-year-old child's handwritten letter/word on notebook guidelines.
Target letter or word to write: "${targetText}".

Examine the child's handwritten ink strokes in the image:
1. DETECT IF BLANK:
   - If the canvas is blank or contains only horizontal lines without student drawing: isCorrect MUST BE FALSE, score: 1.
2. RECOGNIZE THE WRITING (ALLOW FOR GRADE 1 SKILLS):
   - Children use a computer mouse or touch screen. Strokes will naturally be wobbly, thick, imperfect, or slightly off the line.
   - If the child drew strokes that reasonably form or resemble "${targetText}" (upper or lower case): isCorrect MUST BE TRUE, score: 5!
   - Only mark isCorrect: false (score: 2) if they drew an entirely different letter (e.g. wrote 'B' or 'O' when asked for '${targetText}') or random unreadable scribbles.
3. WARM TAGALOG FEEDBACK:
   - If correct: Warmly praise them in Tagalog (e.g., "Napakagaling! Matagumpay mong naisulat ang '${targetText}'!").
   - If incorrect: Kindly tell them what letter was expected and encourage them to try again.

Respond strictly in JSON format:
{
  "isCorrect": boolean,
  "score": number,
  "recognizedText": string,
  "feedbackTagalog": "warm Tagalog feedback",
  "correctionTips": ["friendly tip in Tagalog"],
  "detailedAnalysis": {
    "alignmentScore": number,
    "sizingScore": number,
    "legibilityScore": number
  }
}
`,
          };

          const parsed = await callGeminiJson({ parts: [imagePart, promptPart] });
          if (parsed && typeof parsed.isCorrect === 'boolean') {
            const tgt = targetText.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            const rec = typeof parsed.recognizedText === 'string'
              ? parsed.recognizedText.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
              : '';

            // If the model recognized an entirely different letter/word, flag as incorrect
            if (rec && tgt && rec.length > 0 && !rec.includes(tgt) && !tgt.includes(rec) && rec !== 'hindimalinaw' && rec !== 'walangsulat') {
              // Only override if the recognized text is a completely different letter
              if (rec.length <= 3 && !tgt.startsWith(rec.charAt(0))) {
                parsed.isCorrect = false;
                parsed.score = 2;
                parsed.feedbackTagalog = `Maaari pang pagandahin ang sulat. Ang nakita ay "${parsed.recognizedText}", ngunit ang kailangan ay "${targetText}". Subukan muli!`;
              }
            }

            if (parsed.isCorrect) {
              parsed.score = 5;
              if (!parsed.feedbackTagalog) {
                parsed.feedbackTagalog = `Napakagaling! Matagumpay mong naisulat ang "${targetText}". ⭐ +10 Bituin!`;
              }
            } else {
              parsed.score = parsed.score ? Math.min(parsed.score, 2) : 2;
              if (!parsed.feedbackTagalog) {
                parsed.feedbackTagalog = `Maaari pang pagandahin ang sulat para sa "${targetText}". Sundan ang gabay sa loob ng mga linya.`;
              }
            }

            return res.json(parsed);
          }
        } catch (genErr) {
          console.warn('Gemini vision writing error:', genErr);
        }
      }

      // Safe Fallback when vision model cannot verify: DO NOT assume correct!
      return res.json({
        isCorrect: false,
        score: 2,
        feedbackTagalog: `Hindi mabasa nang malinaw ang iyong isinulat na "${targetText}". Pakisulat muli nang mas malinaw sa loob ng mga linya.`,
        correctionTips: [
          'Gamitin ang mouse upang sundan nang buo ang hugis ng letra.',
          'Panatilihing nasa pagitan ng asul at pulang linya ang mga letra.',
        ],
        detailedAnalysis: {
          alignmentScore: 2,
          sizingScore: 2,
          legibilityScore: 2,
        },
      });
    } catch (err) {
      console.error('Writing API Error:', err);
      res.status(500).json({ error: 'Internal server error evaluating writing' });
    }
  });

  // --- API ROUTE 3: Evaluate Math ---
  app.post('/api/ai/evaluate-math', async (req, res) => {
    try {
      const { imageBase64, num1, num2, operation, expectedAnswer, strokeData } = req.body;

      if (!imageBase64 || expectedAnswer === undefined) {
        return res.status(400).json({ error: 'Missing imageBase64 or expectedAnswer' });
      }

      const pixelCount = strokeData?.pixelCount ?? 150;
      const strokeCount = strokeData?.strokeCount ?? 1;

      // Check if student left canvas blank
      if (pixelCount < 50 || strokeCount === 0) {
        return res.json({
          isCorrect: false,
          score: 1,
          recognizedText: 'walang sulat',
          feedbackTagalog: `Wala ka pang naisusulat na numero sa canvas. Gamitin ang mouse upang isulat ang iyong sagot para sa ${num1} ${operation} ${num2}.`,
          correctionTips: [
            'Gamitin ang mouse upang isulat ang iyong sagot sa loob ng kahon.',
            'Kapag nakasulat na, pindutin ang Isubmit ang Sagot.',
          ],
        });
      }

      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      if (ai) {
        try {
          const imagePart = {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          };

          const promptPart = {
            text: `
You are a warm Grade 1 to 6 Math Teacher in the Philippines evaluating a student's handwritten answer.
The math problem is: ${num1} ${operation} ${num2} = ?
Correct calculated answer is: ${expectedAnswer}.

Examine the image carefully:
1. Identify the number written by the student. It can be a single digit (e.g. 5) or a multi-digit number (e.g. 12, 45, 100, 250).
2. If the student wrote ${expectedAnswer}:
   isCorrect: true, score: 5, recognizedText: "${expectedAnswer}", feedbackTagalog: "Tumpak at napakagaling! Ang sagot sa ${num1} ${operation} ${num2} ay ${expectedAnswer}!", correctionTips: ["Magaling! Ipagpatuloy ang ganyang husay sa matematika."]
3. If the student wrote ANY OTHER NUMBER (e.g. wrote 4 or 9 or 24 instead of ${expectedAnswer}):
   isCorrect: false, score: 2, recognizedText: "<the number actually written>", feedbackTagalog: "Mali ang sagot. Ang isinulat mong numero ay <the number actually written>, ngunit ang tamang sagot sa ${num1} ${operation} ${num2} ay ${expectedAnswer}.", correctionTips: ["Subukang suriin muli ang iyong pagkalkula upang makuha ang ${expectedAnswer}."]
4. If blank/scribble/unclear:
   isCorrect: false, score: 1, recognizedText: "hindi malinaw", feedbackTagalog: "Hindi malinaw ang numero sa canvas. Ang tamang sagot sa ${num1} ${operation} ${num2} ay ${expectedAnswer}. Pakisulat muli nang malinaw ang numero.", correctionTips: ["Isulat nang mas malinaw ang numero gamit ang mouse."]

JSON response:
{
  "isCorrect": boolean,
  "score": number,
  "recognizedText": string,
  "feedbackTagalog": string,
  "correctionTips": string[]
}
`,
          };

          const parsed = await callGeminiJson({ parts: [imagePart, promptPart] });

          if (parsed && typeof parsed.isCorrect === 'boolean') {
            if (typeof parsed.recognizedText === 'string') {
              const cleanedDigits = parsed.recognizedText.replace(/[^0-9]/g, '');
              if (cleanedDigits !== '') {
                if (Number(cleanedDigits) === Number(expectedAnswer)) {
                  parsed.isCorrect = true;
                  parsed.score = 5;
                  parsed.feedbackTagalog = `Tumpak at napakagaling! Ang sagot sa ${num1} ${operation} ${num2} ay ${expectedAnswer}!`;
                } else {
                  parsed.isCorrect = false;
                  parsed.score = 2;
                  parsed.feedbackTagalog = `Mali ang sagot. Ang isinulat mong numero ay ${cleanedDigits}, ngunit ang tamang sagot sa ${num1} ${operation} ${num2} ay ${expectedAnswer}.`;
                }
              }
            }
            return res.json(parsed);
          }
        } catch (genErr) {
          console.warn('Gemini math vision error:', genErr);
        }
      }

      // Safe Fallback: NEVER mark unverified or wrong answer as correct!
      return res.json({
        isCorrect: false,
        score: 2,
        recognizedText: 'hindi matukoy',
        feedbackTagalog: `Hindi matukoy ng AI ang isinulat mong numero para sa ${num1} ${operation} ${num2}. Ang tamang sagot ay ${expectedAnswer}. Pakisulat muli nang mas malinaw gamit ang mouse.`,
        correctionTips: ['Isulat nang mas malinaw ang tamang numero sa loob ng kahon.'],
      });
    } catch (err) {
      console.error('Math API Error:', err);
      res.status(500).json({ error: 'Internal server error evaluating math' });
    }
  });

  // --- DIVERSE CURRICULUM TOPIC DOMAINS (Prevents paraphrasing and ensures distinct subject matter) ---
  const DIVERSE_CURRICULUM_DOMAINS: {
    subject: string;
    topicCategory: string;
    themePrompt: string;
    minGrade: number;
    maxGrade: number;
  }[] = [
    // SCIENCE & NATURE
    {
      subject: 'science',
      topicCategory: 'Astronomy & Cosmic Wonders',
      themePrompt: 'Planetary orbits, moon phases, solar eclipses, constellations (Orion, Cassiopeia), or James Webb space exploration.',
      minGrade: 3,
      maxGrade: 10,
    },
    {
      subject: 'science',
      topicCategory: 'Philippine Marine Ecosystems',
      themePrompt: 'Tubbataha Reefs, coral polyps, mangrove nurseries, Philippine giant clams (Taklobo), or dugongs and whale sharks in Donsol.',
      minGrade: 2,
      maxGrade: 8,
    },
    {
      subject: 'science',
      topicCategory: 'Volcanology & Earth Movements',
      themePrompt: 'Mayon and Taal volcanoes, the Pacific Ring of Fire, tectonic fault lines (Marikina Valley Fault), or magma vs volcanic lava.',
      minGrade: 4,
      maxGrade: 10,
    },
    {
      subject: 'science',
      topicCategory: 'Human Biology & Vital Systems',
      themePrompt: 'Heart chambers and blood circulation, reflex actions in the nervous system, oxygen gas exchange in the lungs, or digestive enzymes.',
      minGrade: 3,
      maxGrade: 10,
    },
    {
      subject: 'science',
      topicCategory: 'Physics & Everyday Forces',
      themePrompt: 'Sound wave propagation through matter, prism light refraction, kinetic vs potential energy, or friction on vehicle tires.',
      minGrade: 3,
      maxGrade: 10,
    },
    {
      subject: 'science',
      topicCategory: 'Chemistry of Daily Life',
      themePrompt: 'Chemical vs physical changes (rusting, photosynthesis, evaporation), states of matter, pH of household liquids, or atomic particles.',
      minGrade: 3,
      maxGrade: 10,
    },
    {
      subject: 'science',
      topicCategory: 'Philippine Wildlife Adaptations',
      themePrompt: 'Philippine Eagle (Pithecophaga jefferyi), Bohol Tarsier night vision, Mindoro Tamaraw, or Calamian deer survival adaptations.',
      minGrade: 1,
      maxGrade: 7,
    },
    {
      subject: 'science',
      topicCategory: 'Meteorology & Weather Systems',
      themePrompt: 'PAGASA storm warning signals, atmospheric pressure in the typhoon eye, Habagat vs Amihan monsoons, or relative humidity.',
      minGrade: 3,
      maxGrade: 10,
    },
    {
      subject: 'science',
      topicCategory: 'Botany & Plant Photosynthesis',
      themePrompt: 'Chlorophyll function, stomata respiration, xylem and phloem nutrient transport, or carnivorous pitcher plants of Palawan.',
      minGrade: 2,
      maxGrade: 8,
    },

    // ARALING PANLIPUNAN (AP) & PHILIPPINE HISTORY
    {
      subject: 'ap',
      topicCategory: 'Pre-Colonial Philippine Civilization',
      themePrompt: 'Balangay maritime trading vessels, Laguna Copperplate Inscription, Boxer Codex, Baybayin script, or the ancient kingdom of Butuan.',
      minGrade: 3,
      maxGrade: 8,
    },
    {
      subject: 'ap',
      topicCategory: 'Philippine Revolution & Heroism',
      themePrompt: 'Katipunan secret society (KKK), the Cry of Pugad Lawin, Andres Bonifacio, Gabriela Silang, Melchora Aquino (Tandang Sora), or Emilio Jacinto.',
      minGrade: 4,
      maxGrade: 9,
    },
    {
      subject: 'ap',
      topicCategory: 'Philippine Geography & Natural Wonders',
      themePrompt: 'San Juanico Strait, Chocolate Hills in Bohol, Puerto Princesa Subterranean River, Sierra Madre mountain range protection, or Maria Cristina Falls.',
      minGrade: 2,
      maxGrade: 7,
    },
    {
      subject: 'ap',
      topicCategory: 'Asian History & Silk Road Civilizations',
      themePrompt: 'The Silk Road overland trade, Mesopotamia Tigris-Euphrates cradle, Ancient Indus Valley civilization, or maritime Southeast Asian trading sultanates.',
      minGrade: 7,
      maxGrade: 9,
    },
    {
      subject: 'ap',
      topicCategory: 'Community Economics & Markets',
      themePrompt: 'Batas ng Demand at Suplay sa lokal na pamilihan, kahalagahan ng pag-iimpok sa bangko, implasyon, o ang papel ng agrikultura sa pambansang ekonomiya.',
      minGrade: 4,
      maxGrade: 10,
    },
    {
      subject: 'ap',
      topicCategory: 'Environmental Law & Civic Responsibility',
      themePrompt: 'Batas sa Solid Waste Management (RA 9003), Clean Air Act, epekto ng climate change sa baybaying dagat, o mga karapatang pantao sa Saligang Batas.',
      minGrade: 5,
      maxGrade: 10,
    },

    // MATHEMATICS & LOGIC
    {
      subject: 'math',
      topicCategory: 'Practical Geometry & Spatial Design',
      themePrompt: 'Angles in architecture (acute, right, obtuse, reflex), perimeter vs area in fencing a garden, symmetry in native woven mats, or 3D volume of water tanks.',
      minGrade: 2,
      maxGrade: 9,
    },
    {
      subject: 'math',
      topicCategory: 'Financial Math & Sari-Sari Store Problems',
      themePrompt: 'Real-world sari-sari store purchase discounts, computing sales tax or interest, coin change combinations, or budget allocation per day.',
      minGrade: 1,
      maxGrade: 8,
    },
    {
      subject: 'math',
      topicCategory: 'Fractions & Ratios in Daily Life',
      themePrompt: 'Doubling a baking recipe with fractional cups, comparing percentages in student quiz scores, or simplifying mixed numbers in carpentry.',
      minGrade: 3,
      maxGrade: 8,
    },
    {
      subject: 'math',
      topicCategory: 'Pattern Sequences & Logic Deductions',
      themePrompt: 'Number sequences with increasing intervals, clock hand degree rotations, finding the missing term in an algebraic balance scale, or logic grid puzzles.',
      minGrade: 2,
      maxGrade: 10,
    },
    {
      subject: 'math',
      topicCategory: 'Speed, Distance & Ferry Navigation',
      themePrompt: 'Travel time of a ferry between Batangas and Calapan, calculating average running speed in meters per second, or elapsed time on bus schedules.',
      minGrade: 4,
      maxGrade: 9,
    },
    {
      subject: 'math',
      topicCategory: 'Probability & Real-World Statistics',
      themePrompt: 'Probability of picking colored marbles from a bag, reading bar graphs of monthly electric consumption, or mean, median, and mode in test scores.',
      minGrade: 4,
      maxGrade: 10,
    },

    // FILIPINO LANGUAGE & CULTURE
    {
      subject: 'filipino',
      topicCategory: 'Sawikain at Matatalinghagang Pahayag',
      themePrompt: 'Kahulugan ng mga sawikain tulad ng "ilaw ng tahanan", "bukas-palad", "nagbibilang ng poste", "balat-sibuyas", o "makapal ang bulsa" sa konteksto ng pangungusap.',
      minGrade: 4,
      maxGrade: 10,
    },
    {
      subject: 'filipino',
      topicCategory: 'Mga Katutubong Epiko at Alamat',
      themePrompt: 'Epikong Biag ni Lam-ang ng Ilokos, Hinilawod ng Panay, Hudhud ng Ifugao, o mga alamat ukol sa pinagmulan ng Bundok Makiling.',
      minGrade: 3,
      maxGrade: 8,
    },
    {
      subject: 'filipino',
      topicCategory: 'Klasikong Panitikan ni Balagtas at Rizal',
      themePrompt: 'Ibong Adarna (mga pagsubok ni Don Juan), Florante at Laura ni Francisco Balagtas, o ang mga lihim ng Noli Me Tangere / El Filibusterismo ni Dr. Jose Rizal.',
      minGrade: 7,
      maxGrade: 10,
    },
    {
      subject: 'filipino',
      topicCategory: 'Wastong Balarila at Gamit ng Salita',
      themePrompt: 'Wastong paggamit ng ng/nang, may/mayroon, pinto/pintuan, hagdan/hagdanan, o aspekto ng pandiwa sa makabuluhang sitwasyon.',
      minGrade: 3,
      maxGrade: 8,
    },
    {
      subject: 'filipino',
      topicCategory: 'Salawikain, Bugtong at Karunungang-Bayan',
      themePrompt: 'Pagsusuri sa aral ng mga tradisyunal na salawikain sa pakikipagkapwa o mga mapanlikhang bugtong tungkol sa kalikasan.',
      minGrade: 2,
      maxGrade: 7,
    },

    // ENGLISH LANGUAGE & LITERATURE
    {
      subject: 'english',
      topicCategory: 'Figurative Language & Sensory Imagery',
      themePrompt: 'Similes, metaphors, hyperbole, personification, onomatopoeia, and situational irony in descriptive passages.',
      minGrade: 4,
      maxGrade: 10,
    },
    {
      subject: 'english',
      topicCategory: 'Context Clues & Word Origins',
      themePrompt: 'Determining the meaning of advanced vocabulary words using surrounding context clues, Greek/Latin prefixes (e.g. bio-, tele-, sub-), and suffixes.',
      minGrade: 3,
      maxGrade: 9,
    },
    {
      subject: 'english',
      topicCategory: 'Reading Inference & Author Intent',
      themePrompt: 'Short 2-sentence scenario testing drawing logical conclusions, identifying author purpose, or distinguishing cause from effect.',
      minGrade: 2,
      maxGrade: 9,
    },
    {
      subject: 'english',
      topicCategory: 'World Mythology & Classical Fables',
      themePrompt: 'Greek myths (Icarus, King Midas, Pandora), Aesop fables and their moral lessons, or folklore archetypes.',
      minGrade: 3,
      maxGrade: 10,
    },

    // MAPEH (MUSIC, ARTS, PE, HEALTH)
    {
      subject: 'mapeh',
      topicCategory: 'Traditional Filipino Music & Instruments',
      themePrompt: 'Indigenous instruments like Kulintang of Mindanao, Kalinga Tongatong bamboo stamper, Kudyapi two-stringed lute, or tempo markings in Kundiman.',
      minGrade: 2,
      maxGrade: 8,
    },
    {
      subject: 'mapeh',
      topicCategory: 'Indigenous Weaving & Visual Arts',
      themePrompt: 'Inabel weaving of Ilocos, T’nalak dreamweavers of Lake Sebu, Paete woodcarvings, or the color harmony wheel.',
      minGrade: 2,
      maxGrade: 8,
    },
    {
      subject: 'mapeh',
      topicCategory: 'Philippine Traditional Games (Larong Lahi)',
      themePrompt: 'Game mechanics, motor skills, and safety rules of Patintero, Tumbang Preso, Luksong Tinik, Piko, or Agawan Base.',
      minGrade: 1,
      maxGrade: 7,
    },
    {
      subject: 'mapeh',
      topicCategory: 'First Aid & Emergency Safety',
      themePrompt: 'RICE method for ankle sprains (Rest, Ice, Compression, Elevation), treating heat exhaustion, first-degree burn care, or disaster earthquake drills (Duck, Cover, Hold).',
      minGrade: 3,
      maxGrade: 10,
    },
    {
      subject: 'mapeh',
      topicCategory: 'Nutrition & Balanced Diet',
      themePrompt: 'Go, Grow, and Glow foods, essential micronutrients (Iron for blood, Vitamin C for immunity, Calcium for bones), or reading food nutrition labels.',
      minGrade: 1,
      maxGrade: 7,
    },

    // EPP / TLE (TECH & VOCATIONAL)
    {
      subject: 'epp',
      topicCategory: 'Digital Literacy & Computer Safety',
      themePrompt: 'Keyboard shortcut keys (Ctrl+C, Ctrl+V, Ctrl+Z), file extensions (.png, .mp3, .pdf), recognizing phishing messages, or spreadsheet formula basics (=SUM).',
      minGrade: 4,
      maxGrade: 10,
    },
    {
      subject: 'epp',
      topicCategory: 'Urban Gardening & Basic Sewing',
      themePrompt: 'Hydroponics and vegetable seedling transplanting, basic hand sewing stitches (running stitch, backstitch), or food preservation methods.',
      minGrade: 4,
      maxGrade: 8,
    },

    // ESP (VALUES EDUCATION)
    {
      subject: 'esp',
      topicCategory: 'Integridad, Katapatan at Pagpapasya',
      themePrompt: 'Pagpapakita ng katapatan sa pagbabalik ng napulot na gamit, paggalang sa opinyon ng kapwa, pamumuno nang may pananagutan, o wastong paggamit ng social media.',
      minGrade: 1,
      maxGrade: 10,
    },
  ];

  const SUBJECT_METADATA_MAP: Record<
    string,
    { label: string; tagalog: string; icon: string; color: string }
  > = {
    science: { label: 'Science', tagalog: 'Agham', icon: '🔬', color: '#10b981' },
    math: { label: 'Mathematics', tagalog: 'Matematika', icon: '📐', color: '#3b82f6' },
    filipino: { label: 'Filipino', tagalog: 'Wikang Filipino', icon: '🇵🇭', color: '#ef4444' },
    english: { label: 'English', tagalog: 'English Language', icon: '📖', color: '#6366f1' },
    ap: { label: 'Araling Panlipunan', tagalog: 'Kasaysayan at Lipunan', icon: '🏛️', color: '#f59e0b' },
    esp: { label: 'ESP', tagalog: 'Edukasyon sa Pagpapakatao', icon: '🤝', color: '#10b981' },
    epp: { label: 'EPP', tagalog: 'Edukasyong Pantahanan at Pangkabuhayan', icon: '🧵', color: '#8b5cf6' },
    tle: { label: 'TLE', tagalog: 'Technology & Livelihood Education', icon: '⚙️', color: '#0ea5e9' },
    mapeh: { label: 'MAPEH', tagalog: 'Music, Arts, PE & Health', icon: '🎨', color: '#ec4899' },
  };

  // --- API ROUTE 4: Generate Diverse, Non-Repeating, Non-Paraphrased DepEd BOW Quiz Questions ---
  app.post('/api/ai/deped-quiz', async (req, res) => {
    try {
      const {
        gradeLevel = 'all',
        subject = 'all',
        customTopic = '',
        language = 'all',
        excludeQuestions = [],
        excludeTopics = [],
        lastSubject = null,
        count = 1,
      } = req.body;

      const requestedCount = Math.min(Math.max(1, Number(count) || 1), 5);
      const allCoreSubjects = ['science', 'ap', 'math', 'filipino', 'mapeh', 'english', 'esp', 'epp'];
      const trimmedCustomTopic = typeof customTopic === 'string' ? customTopic.trim() : '';

      // Step 1: Select distinct subjects for each requested question to prevent similar subject matter
      const selectedPlan: {
        subject: string;
        targetGrade: number;
        domain: (typeof DIVERSE_CURRICULUM_DOMAINS)[0];
        customTopic?: string;
      }[] = [];

      // Subjects used in this batch
      const batchUsedSubjects = new Set<string>();
      if (lastSubject && subject === 'all') {
        batchUsedSubjects.add(String(lastSubject).toLowerCase());
      }

      // Topics excluded
      const normalizedExcludedTopics = (Array.isArray(excludeTopics) ? excludeTopics : [])
        .map((t: string) => String(t).toLowerCase());

      // Questions excluded (to strictly forbid repeating identical or similar question stems)
      const normalizedExcludedQuestions = (Array.isArray(excludeQuestions) ? excludeQuestions : [])
        .map((q: string) => String(q).trim().toLowerCase())
        .filter((q: string) => q.length > 5);

      for (let i = 0; i < requestedCount; i++) {
        let qSubject = subject;
        if (subject === 'all') {
          // Find core subjects not yet used in this batch
          const candidateSubjects = allCoreSubjects.filter((s) => !batchUsedSubjects.has(s));
          if (candidateSubjects.length > 0) {
            qSubject = candidateSubjects[Math.floor(Math.random() * candidateSubjects.length)];
          } else {
            // If exhausted all, pick random
            qSubject = allCoreSubjects[Math.floor(Math.random() * allCoreSubjects.length)];
          }
          batchUsedSubjects.add(qSubject);
        }

        const qGrade =
          gradeLevel === 'all'
            ? Math.floor(Math.random() * 10) + 1
            : Math.min(10, Math.max(1, Number(gradeLevel)));

        let pickedDomain: (typeof DIVERSE_CURRICULUM_DOMAINS)[0];

        // If user typed a custom topic, focus the domain strictly on the user's custom topic
        if (trimmedCustomTopic) {
          pickedDomain = {
            subject: qSubject === 'all' ? 'science' : qSubject,
            topicCategory: trimmedCustomTopic,
            themePrompt: `Specific principles, fascinating facts, real-world applications, scenarios, and problems regarding "${trimmedCustomTopic}".`,
            minGrade: 1,
            maxGrade: 10,
          };
        } else {
          // Find domains matching this subject and grade level
          let matchingDomains = DIVERSE_CURRICULUM_DOMAINS.filter(
            (d) =>
              d.subject === qSubject &&
              qGrade >= d.minGrade &&
              qGrade <= d.maxGrade &&
              !normalizedExcludedTopics.some((et: string) =>
                d.topicCategory.toLowerCase().includes(et) || et.includes(d.topicCategory.toLowerCase())
              )
          );

          // Fallback to any domain in this subject if strict filter was too tight
          if (matchingDomains.length === 0) {
            matchingDomains = DIVERSE_CURRICULUM_DOMAINS.filter((d) => d.subject === qSubject);
          }

          // Absolute fallback to any domain in database
          if (matchingDomains.length === 0) {
            matchingDomains = DIVERSE_CURRICULUM_DOMAINS;
          }

          pickedDomain = matchingDomains[Math.floor(Math.random() * matchingDomains.length)];
        }

        selectedPlan.push({
          subject: qSubject,
          targetGrade: qGrade,
          domain: pickedDomain,
          customTopic: trimmedCustomTopic || undefined,
        });
      }

      const planDescriptions = selectedPlan
        .map(
          (p, idx) => `
QUESTION #${idx + 1} SPECIFICATIONS:
- Target Grade: Grade ${p.targetGrade} (Baitang ${p.targetGrade})
- Subject: ${p.subject.toUpperCase()} (${SUBJECT_METADATA_MAP[p.subject]?.label || p.subject})
- Mandatory Topic Category: "${p.domain.topicCategory}"
- Curriculum Theme & Context: ${p.domain.themePrompt}
${p.customTopic ? `*** CRITICAL USER CUSTOM TOPIC MANDATE: The user explicitly typed "${p.customTopic}". The question MUST test knowledge, scenarios, or interesting dilemmas specifically about "${p.customTopic}"! ***` : ''}
- Language: ${
  language === 'filipino'
    ? 'Strictly Natural, correct, standard Tagalog/Filipino language for the entire question, all 4 options, and explanation'
    : language === 'english'
    ? 'Strictly Clear, fluent English language for the entire question, all 4 options, and explanation'
    : ['filipino', 'ap', 'esp', 'epp'].includes(p.subject)
    ? 'Natural, correct Tagalog/Filipino'
    : 'Clear English (or Tagalog if covering Philippine folk culture)'
}
`
        )
        .join('\n');

      const systemPrompt = `You are Groq AI, an expert master teacher and curriculum writer for the Department of Education (DepEd) Philippines and Blox Fruits Game.
Your task is to generate ${requestedCount} completely distinct, creative, engaging multiple-choice question(s).

=== STRICT USER DIRECTIVES TO PREVENT PARAPHRASING AND REPETITION ===
1. ABSOLUTELY NO PARAPHRASING:
   - You MUST NOT reword, recycle, or paraphrase any question formulas or recent questions.
   - BANNED repetitive patterns:
     * DO NOT write "Alin sa mga sumusunod ang halimbawa ng..."
     * DO NOT write "What is the opposite/synonym of..."
     * DO NOT write simple arithmetic equations like "What is X + Y?"
     * DO NOT write "Alin ang pangngalan/pandiwa/pang-uri..."
   - Instead, construct an authentic, immersive question based on a real-world scenario, intriguing scientific phenomenon, historical mystery, practical daily decision, cultural dilemma, or logic puzzle!

2. TOTALLY DIFFERENT SUBJECT MATTER FOR EVERY QUESTION:
   - Every question MUST explore a completely different topic and cognitive challenge.
   - Do NOT generate questions on any of these recently asked questions or topics:
${normalizedExcludedQuestions.length > 0 ? normalizedExcludedQuestions.slice(-20).map((q: string, idx: number) => `   * Banned: "${q}"`).join('\n') : '   * (None yet - first question)'}
   - Excluded topics: ${normalizedExcludedTopics.length > 0 ? normalizedExcludedTopics.slice(-15).join(', ') : '(None)'}

3. ACCURACY & OPTIONS QUALITY:
   - Provide exactly 4 options. All 4 options must be plausible and well-written.
   - Exactly ONE option must be clearly and factually correct.
   - The "correctIndex" must be randomized (0, 1, 2, or 3).
   - The "explanation" must be encouraging, educational, and explain WHY the correct answer is right.

RETURN STRICTLY A JSON OBJECT MATCHING THIS SCHEMA:
{
  "questions": [
    {
      "id": "groq-q-${Date.now()}-...",
      "gradeLevel": number,
      "subject": "filipino" | "english" | "math" | "science" | "ap" | "esp" | "epp" | "tle" | "mapeh",
      "subjectLabel": string,
      "subjectTagalog": string,
      "subjectIcon": string,
      "subjectColor": string,
      "topicCategory": string,
      "question": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string,
      "bonusStars": number
    }
  ]
}`;

      const userPrompt = `Generate ${requestedCount} completely unique, non-repeating questions according to these specifications:\n${planDescriptions}`;

      // 1. Try Groq AI first for ultra-fast, creative, non-repeating generation
      if (groqApiKey) {
        try {
          const groqResult = await callGroqJson([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ]);

          if (groqResult && Array.isArray(groqResult.questions) && groqResult.questions.length > 0) {
            const enrichedQuestions = groqResult.questions.map((q: any, idx: number) => {
              const assigned = selectedPlan[idx] || selectedPlan[0];
              const cleanSubject = String(q.subject || assigned.subject || 'science').toLowerCase().trim();
              const meta =
                SUBJECT_METADATA_MAP[cleanSubject] ||
                SUBJECT_METADATA_MAP[assigned.subject] ||
                SUBJECT_METADATA_MAP['science'];

              return {
                id: q.id || `groq-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                gradeLevel: Number(q.gradeLevel) || assigned.targetGrade,
                subject: cleanSubject,
                subjectLabel: q.subjectLabel || meta.label,
                subjectTagalog: q.subjectTagalog || meta.tagalog,
                subjectIcon: q.subjectIcon || meta.icon,
                subjectColor: q.subjectColor || meta.color,
                topicCategory: q.topicCategory || assigned.domain.topicCategory,
                question: String(q.question).trim(),
                options: Array.isArray(q.options) && q.options.length === 4
                  ? q.options.map((o: any) => String(o).trim())
                  : ['Option A', 'Option B', 'Option C', 'Option D'],
                correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
                explanation: String(q.explanation || 'Tamang sagot batay sa DepEd Curriculum.').trim(),
                bonusStars: Number(q.bonusStars) || 50,
                aiSource: 'groq',
              };
            });

            return res.json({ success: true, questions: enrichedQuestions, source: 'groq' });
          }
        } catch (groqErr) {
          console.warn('[Groq AI] DepEd Quiz generation failed, falling back to Gemini:', groqErr);
        }
      }

      // 2. Fallback to Gemini if Groq is unavailable
      if (ai) {
        const geminiPrompt = `${systemPrompt}\n\n${userPrompt}`;
        for (const modelName of GEMINI_MODELS) {
          try {
            const resp = await ai.models.generateContent({
              model: modelName,
              contents: geminiPrompt,
              config: {
                responseMimeType: 'application/json',
                temperature: 1.05,
              },
            });

            if (resp && resp.text) {
              const parsed = JSON.parse(resp.text.trim());
              if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                const enrichedQuestions = parsed.questions.map((q: any, idx: number) => {
                  const assigned = selectedPlan[idx] || selectedPlan[0];
                  const meta =
                    SUBJECT_METADATA_MAP[q.subject] ||
                    SUBJECT_METADATA_MAP[assigned.subject] ||
                    SUBJECT_METADATA_MAP['science'];

                  return {
                    id: q.id || `gemini-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    gradeLevel: Number(q.gradeLevel) || assigned.targetGrade,
                    subject: q.subject || assigned.subject,
                    subjectLabel: q.subjectLabel || meta.label,
                    subjectTagalog: q.subjectTagalog || meta.tagalog,
                    subjectIcon: q.subjectIcon || meta.icon,
                    subjectColor: q.subjectColor || meta.color,
                    topicCategory: q.topicCategory || assigned.domain.topicCategory,
                    question: String(q.question).trim(),
                    options: Array.isArray(q.options) && q.options.length === 4
                      ? q.options.map((o: any) => String(o).trim())
                      : ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
                    explanation: String(q.explanation || 'Tamang sagot batay sa DepEd Curriculum.').trim(),
                    bonusStars: Number(q.bonusStars) || 50,
                    aiSource: 'gemini',
                  };
                });

                return res.json({ success: true, questions: enrichedQuestions, source: 'gemini' });
              }
            }
          } catch (mErr: any) {
            console.warn(`[Gemini DepEd Quiz] ${modelName} failed:`, mErr?.message || mErr);
          }
        }
      }

      // Safe fallback when Gemini and Groq are offline
      return res.json({ success: false, questions: [], source: 'fallback' });
    } catch (err: any) {
      console.error('DepEd Quiz API Error:', err);
      res.status(500).json({ error: 'Failed to generate DepEd questions' });
    }
  });

  // --- API ROUTE 5: Alaga Pet Combat AI Challenge Generator (Reading & Math, Grade 1 to 6) ---
  app.post('/api/ai/combat-challenge', async (req, res) => {
    try {
      const {
        mode = 'reading', // 'reading' | 'math'
        gradeLevel = 1,   // 1 to 6
        excludeWords = [],
        excludeQuestions = [],
        count = 1,
      } = req.body;

      const grade = Math.min(6, Math.max(1, Number(gradeLevel) || 1));
      const requestedCount = Math.min(3, Math.max(1, Number(count) || 1));
      const normalizedExcludedWords = Array.isArray(excludeWords)
        ? excludeWords.map((w: any) => String(w).trim().toUpperCase())
        : [];
      const normalizedExcludedQuestions = Array.isArray(excludeQuestions)
        ? excludeQuestions.map((q: any) => String(q).trim().toLowerCase())
        : [];

      if (ai) {
        let systemPrompt = '';
        if (mode === 'english') {
          systemPrompt = `
You are an Elementary English Reading & Literacy Specialist.
Generate ${requestedCount} distinct, unique English reading word challenge(s) for Grade ${grade} elementary students.

CRITICAL NON-REPETITION MANDATE:
- ABSOLUTELY DO NOT use ANY of these previously asked words or recent words: ${normalizedExcludedWords.slice(-60).join(', ') || '(none yet)'}.
- NEVER repeat a word or reading sentence that was already presented.
- All words must be completely fresh, unique, and age-appropriate for Grade ${grade}:
  * Grade 1: Foundational English sight words & phonics CVC words (e.g. FAMILY, FRIEND, SUNSHINE, MORNING, WATER, GARDEN, LITTLE, SMILE, SCHOOL, BREAD, PENCIL, HAPPY).
  * Grade 2: 2-syllable familiar English vocabulary and nature words (e.g. KITCHEN, FLOWER, BASKET, WINDOW, BREAKFAST, BLANKET, MARKET, RAINBOW, SISTER, BROTHER).
  * Grade 3: 2-3 syllable daily life vocabulary and descriptive words (e.g. BEAUTIFUL, TOGETHER, HEALTHY, NEIGHBOR, CAREFUL, DELICIOUS, CLASSROOM, WEATHER, EXERCISE, PATIENT).
  * Grade 4: Multi-syllable vocabulary relating to community, nature, science, and cooperation (e.g. DISCOVER, COMMUNITY, ENVIRONMENT, ADVENTURE, CELEBRATION, COOPERATION, IMPORTANT, HARVEST).
  * Grade 5: Abstract & academic vocabulary, values, environment, and communication (e.g. RESPONSIBILITY, KNOWLEDGE, GENEROSITY, APPRECIATION, OPPORTUNITY, ECOSYSTEM, COMMUNICATION, NUTRITION).
  * Grade 6: Advanced vocabulary, civic concepts, leadership, and critical thinking (e.g. PERSEVERANCE, CIVILIZATION, PARTICIPATION, SUSTAINABLE, BIODIVERSITY, EXTRAORDINARY, DEMOCRACY, PERSPECTIVE).

For EACH challenge, return:
- "targetWord": Uppercase word to read (e.g. "TOGETHER")
- "syllables": Array of syllables (e.g. ["TO", "GETH", "ER"])
- "phoneticGuide": English pronunciation phonics guide (e.g. "tuh-GETH-er")
- "clue": Short, friendly clue in English (e.g. "With each other in a group or family")
- "readingPassage": A short natural sentence containing the word in daily life (e.g. "We clean our classroom together every morning.")
- "options": Exactly 4 unique choices (the targetWord and 3 plausible distractor words of similar length)
- "correctAnswer": The targetWord

RETURN STRICTLY A JSON OBJECT matching:
{
  "challenges": [
    {
      "mode": "english",
      "gradeLevel": ${grade},
      "targetWord": "...",
      "syllables": ["..."],
      "phoneticGuide": "...",
      "clue": "...",
      "readingPassage": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "..."
    }
  ]
}
`;
        } else if (mode === 'reading') {
          systemPrompt = `
You are a DepEd Philippines Elementary Reading & Literacy Specialist.
Generate ${requestedCount} distinct, unique Filipino reading word challenge(s) for Grade ${grade} students in an RPG Pet Combat Game.

CRITICAL NON-REPETITION MANDATE:
- ABSOLUTELY DO NOT use ANY of these previously asked words or recent words: ${normalizedExcludedWords.slice(-60).join(', ') || '(none yet)'}.
- NEVER repeat a word or reading sentence that was already presented.
- All words must be completely fresh, unique, and age-appropriate for Grade ${grade}:
  * Grade 1: 2-3 syllable foundational Marungko/Filipino words (e.g. MATA, BATA, DAHON, ASO, PUSA, GATAS, TASA, BATO).
  * Grade 2: 2-3 syllable familiar Filipino words (e.g. KABAYO, BULAKLAK, MASAYA, KUBYERTO, SAPATOS, BANDILA, ULAN).
  * Grade 3: 3-4 syllable Filipino vocabulary and descriptive words (e.g. PANGARAP, KAPALIGIRAN, KASIPAGAN, MAGALANG, BAHAGHARI, TULAY).
  * Grade 4: Multi-syllable Filipino words relating to community, nature, and culture (e.g. KALIKASAN, KASAYSAYAN, PAGTUTULUNGAN, KAYAMANAN, PAMAYANAN, TAHIMIK).
  * Grade 5: Abstract & academic vocabulary, values, environment (e.g. PANGANGALAGA, RESPONSIBILIDAD, PAGPAPAHALAGA, KALUSUGAN, PAGKAKAIBIGAN, LIWANAG).
  * Grade 6: Advanced vocabulary, civic concepts, science & society (e.g. KATAPATAN, PAGKAKAISA, TEKNOLOHIYA, KARANGALAN, KALAYAAN, KATARUNGAN).

For EACH challenge, return:
- "targetWord": Uppercase word to read (e.g. "KALIKASAN")
- "syllables": Array of syllables (e.g. ["KA", "LI", "KA", "SAN"])
- "phoneticGuide": Baybay guide (e.g. "KA + LI + KA + SAN")
- "clue": Short, friendly clue in Tagalog (e.g. "Ang ating kapaligiran at mga halaman")
- "readingPassage": A short natural sentence containing the word (e.g. "Ingatan natin ang ating kalikasan.")
- "options": Exactly 4 unique choices (the targetWord and 3 plausible distractor words of similar length)
- "correctAnswer": The targetWord

RETURN STRICTLY A JSON OBJECT matching:
{
  "challenges": [
    {
      "mode": "reading",
      "gradeLevel": ${grade},
      "targetWord": "...",
      "syllables": ["..."],
      "phoneticGuide": "...",
      "clue": "...",
      "readingPassage": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "..."
    }
  ]
}
`;
        } else {
          // mode === 'math' -> MUST BE IN ENGLISH AND GROUNDED IN REAL DAILY LIFE SITUATIONS
          systemPrompt = `
You are an Elementary Mathematics Teacher.
Generate ${requestedCount} unique, engaging math question(s) strictly tailored for Grade ${grade} elementary students.

CRITICAL LANGUAGE & REAL-LIFE MANDATES:
1. STRICTLY ENGLISH: All questions, explanations, options, and hints MUST BE IN ENGLISH.
2. REAL DAILY LIFE SITUATIONS ONLY: Every question MUST describe relatable, real-world human situations (grocery shopping, cooking, saving in a piggy bank, sharing snacks with siblings/friends, school supplies, time, gardening, baking, bus fares).
3. ABSOLUTELY NO GAME SITUATIONS OR MECHANICS: NEVER mention game HP, attacks, damage, monsters, dragons, battle stats, or video game items. Frame every problem around real everyday life!
4. CRITICAL NON-REPETITION MANDATE:
   - ABSOLUTELY DO NOT generate ANY questions identical or similar to these excluded items: ${normalizedExcludedQuestions.slice(-60).join('; ') || '(none yet)'}.
   - NEVER repeat a math question that was previously asked.

Curriculum by Grade Level:
- Grade 1: Daily life addition & subtraction within 20:
  * e.g. "Leo bought 7 red apples and 6 green apples at the fruit stand. How many apples did he buy in all?"
  * e.g. "Mother had 15 fresh eggs in a basket. She used 6 eggs to bake a cake. How many eggs are left?"
- Grade 2: 2-digit addition and subtraction within 100, basic skip counting & coin/peso savings:
  * e.g. "At the bakery, a box of pandesal costs ₱35 and a carton of milk costs ₱45. What is the total cost?"
  * e.g. "A school bus has 48 seats. If 26 students are already seated, how many seats are still empty?"
  * e.g. "Sarah has 5 small jars with 6 cookies in each jar. How many cookies does she have in total?"
- Grade 3: Multiplication tables (up to 10), basic division, simple fractions & sharing:
  * e.g. "Father bought 4 packs of juice boxes. Each pack contains 6 boxes. How many juice boxes are there in all?"
  * e.g. "Teacher Grace has 36 colored pencils to share equally among 4 students. How many pencils does each student receive?"
  * e.g. "A pizza is cut into 8 equal slices. If Mark and his sister eat 5 slices together, what fraction of the pizza was eaten?"
- Grade 4: Multi-digit daily expenses, sharing harvest, perimeter & volume of everyday objects:
  * e.g. "A farmer harvested 145 kilograms of rice on Monday and 180 kilograms on Tuesday. How many kilograms were harvested in total?"
  * e.g. "A rectangular vegetable garden is 8 meters long and 6 meters wide. What is the perimeter of the garden in meters?"
  * e.g. "A large pitcher contains 950 milliliters of water. If Ella pours 350 milliliters into a glass, how many milliliters of water remain?"
- Grade 5: Decimals in shopping, percentages (discounts/taxes), and fraction operations in cooking/recipes:
  * e.g. "A school backpack originally priced at ₱400 is on a 25% discount sale. How much is the discount in pesos?"
  * e.g. "Anna bought 2.5 kilograms of mangoes and 1.75 kilograms of bananas at the market. What is the total weight in kilograms?"
  * e.g. "A recipe calls for 3/4 cup of sugar, but Kevin only has 1/2 cup. How much more sugar does he need?"
- Grade 6: Real-world ratios, proportions, daily budget averages, and percentage problems:
  * e.g. "The ratio of boys to girls in a school choir is 2 to 3. If there are 10 boys, how many girls are in the choir?"
  * e.g. "Lucas saved ₱120 on Monday, ₱150 on Tuesday, and ₱180 on Wednesday. What is his average daily savings?"
  * e.g. "A water tank holds 250 liters when completely full. If the tank is currently 60% full, how many liters of water are inside?"

For EACH question, return:
- "mathQuestion": The complete word problem or equation strictly in English (e.g. "Mother bought 8 mangoes and 7 oranges. How many fruits did she buy in total?")
- "mathEmoji": A friendly daily-life emoji (e.g. "🍎", "🍞", "🥛", "✏️", "🚌", "🪴", "🍪", "🧺")
- "options": Exactly 4 unique answer choices with units where appropriate as strings (e.g. ["15 fruits", "14 fruits", "16 fruits", "13 fruits"])
- "correctAnswer": The exact correct choice string (e.g. "15 fruits")
- "correctIndex": Index (0, 1, 2, or 3) of the correct choice
- "explanation": Clear, friendly step-by-step solution in English
- "mathHint": Practical real-life tip or hint in English

RETURN STRICTLY A JSON OBJECT matching:
{
  "challenges": [
    {
      "mode": "math",
      "gradeLevel": ${grade},
      "mathQuestion": "...",
      "mathEmoji": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "correctIndex": 0,
      "explanation": "...",
      "mathHint": "..."
    }
  ]
}
`;
        }

        for (const modelName of GEMINI_MODELS) {
          try {
            const resp = await ai.models.generateContent({
              model: modelName,
              contents: systemPrompt,
              config: {
                responseMimeType: 'application/json',
              },
            });

            if (resp && resp.text) {
              const parsed = JSON.parse(resp.text.trim());
              if (parsed && Array.isArray(parsed.challenges) && parsed.challenges.length > 0) {
                return res.json({ success: true, challenges: parsed.challenges, source: 'ai' });
              }
            }
          } catch (mErr: any) {
            console.warn(`[Gemini Combat Challenge] ${modelName} failed:`, mErr?.message || mErr);
          }
        }
      }

      return res.json({ success: false, challenges: [], source: 'fallback' });
    } catch (err: any) {
      console.error('Combat Challenge API Error:', err);
      res.status(500).json({ error: 'Failed to generate combat challenge' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
