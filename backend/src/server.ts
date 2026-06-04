import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads

const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini API initialized successfully.');
} else {
  console.warn('⚠️ No GEMINI_API_KEY provided in .env! Backend will return mock data as a fallback.');
}

// ==========================================
// FOOD SEARCH ENDPOINT
// ==========================================
app.get('/api/search/food', async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  console.log(`[API] Searching internet for food: "${query}"`);

  if (!genAI) {
    // Fallback to mock data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return res.json([
      {
        id: `food-${Date.now()}-mock`,
        name: `${query.charAt(0).toUpperCase() + query.slice(1)} (Mock Result)`,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
        calories: 300,
        protein: 20,
        carbs: 30,
        fat: 10,
        weight: 100,
      }
    ]);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              name: { type: SchemaType.STRING, description: "Name of the food" },
              image: { type: SchemaType.STRING, description: "A highly relevant, valid URL of an image of this food (e.g. from unsplash or wikipedia)" },
              calories: { type: SchemaType.NUMBER, description: "Calories per 100g" },
              protein: { type: SchemaType.NUMBER, description: "Protein per 100g in grams" },
              carbs: { type: SchemaType.NUMBER, description: "Carbs per 100g in grams" },
              fat: { type: SchemaType.NUMBER, description: "Fat per 100g in grams" },
              weight: { type: SchemaType.NUMBER, description: "Default weight (always 100)" }
            },
            required: ["id", "name", "image", "calories", "protein", "carbs", "fat", "weight"]
          }
        }
      }
    });

    const prompt = `You are a nutrition database. The user is searching for "${query}". Return a JSON array with exactly 1 or 2 high-quality, realistic results for this food. The metrics MUST be accurate per 100g serving. For the image, provide a real HTTPS image URL from Unsplash or Wikimedia. Example URL: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    
    // Ensure IDs are unique
    const formattedData = data.map((item: any, i: number) => ({
      ...item,
      id: `food-${Date.now()}-${i}`
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching from Gemini API:', error);
    res.status(500).json({ error: 'Failed to search for food' });
  }
});

// ==========================================
// EXERCISE SEARCH ENDPOINT
// ==========================================
app.get('/api/search/exercise', async (req, res) => {
  const query = (req.query.q as string) || '';
  const muscle = (req.query.muscle as string) || '';
  
  const target = query || muscle || 'Full Body';
  if (!target) {
    return res.status(400).json({ error: 'Missing query or muscle parameter' });
  }

  console.log(`[API] Searching internet for exercise: "${target}"`);

  if (!genAI) {
    // Fallback to mock data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return res.json([
      {
        id: `ex-${Date.now()}-mock`,
        name: `${target} (Mock Result)`,
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80',
        muscleTargeted: target,
        exerciseType: 'Strength Training',
        setsNeeded: 3,
        repsNeeded: 10,
      }
    ]);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              id: { type: SchemaType.STRING },
              name: { type: SchemaType.STRING, description: "Name of the exercise" },
              image: { type: SchemaType.STRING, description: "A highly relevant URL of an image of this exercise (e.g. unsplash)" },
              muscleTargeted: { type: SchemaType.STRING, description: "Primary muscle group targeted" },
              exerciseType: { type: SchemaType.STRING, description: "Type of exercise (Strength, Hypertrophy, Cardio)" },
              setsNeeded: { type: SchemaType.NUMBER, description: "Recommended number of sets" },
              repsNeeded: { type: SchemaType.NUMBER, description: "Recommended number of reps" }
            },
            required: ["id", "name", "image", "muscleTargeted", "exerciseType", "setsNeeded", "repsNeeded"]
          }
        }
      }
    });

    const prompt = `You are a fitness expert database. The user is searching for an exercise: "${target}". Return a JSON array with exactly 1 or 2 high-quality, optimal exercise variations for this search. Provide accurate recommended sets and reps. For the image, provide a real HTTPS image URL from Unsplash. Example URL: https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    
    // Ensure IDs are unique
    const formattedData = data.map((item: any, i: number) => ({
      ...item,
      id: `ex-${Date.now()}-${i}`
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching from Gemini API:', error);
    res.status(500).json({ error: 'Failed to search for exercise' });
  }
});

// ==========================================
// AI COACH CHAT ENDPOINT
// ==========================================
app.post('/api/coach/chat', async (req, res) => {
  const { messages, userProfile } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  console.log('[API] Processing AI Coach Chat...');

  if (!genAI) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return res.json({ text: "I'm your mock AI coach! Please add a GEMINI_API_KEY to the backend .env file to unlock my full brain." });
  }

  try {
    const profileContext = userProfile 
      ? `User Profile: Weight: ${userProfile.weight}kg, Goal: ${userProfile.goal}, Calories Target: ${userProfile.calorieTarget}kcal.` 
      : '';
    const systemPrompt = `You are ATHLEX, an elite, scientific AI fitness and nutrition coach. You are concise, highly motivating, and give data-driven advice. Keep responses under 3 short sentences unless explaining a complex topic. ${profileContext}`;
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] }
    });

    const chatHistory = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Start chat with all history except the last message
    const previousHistory = chatHistory.slice(0, -1);
    const chat = model.startChat({ history: previousHistory });

    const lastMessage = chatHistory[chatHistory.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    
    res.json({ text: result.response.text() });
  } catch (error) {
    console.error('Error in AI Coach Chat:', error);
    res.status(500).json({ error: 'Failed to generate coach response' });
  }
});

// ==========================================
// AI VISION FOOD SCANNER ENDPOINT
// ==========================================
app.post('/api/vision/scan-food', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }

  console.log('[API] Analyzing Food Image with AI Vision...');

  if (!genAI) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return res.json({
      name: "Mock Scanned Chicken & Rice (No API Key)",
      calories: 450,
      protein: 40,
      carbs: 45,
      fat: 12,
      weight: 350
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: "Name of the detected food dish" },
            calories: { type: SchemaType.NUMBER, description: "Total estimated calories for the entire portion shown" },
            protein: { type: SchemaType.NUMBER, description: "Total estimated protein in grams" },
            carbs: { type: SchemaType.NUMBER, description: "Total estimated carbs in grams" },
            fat: { type: SchemaType.NUMBER, description: "Total estimated fat in grams" },
            weight: { type: SchemaType.NUMBER, description: "Estimated total weight in grams of the portion" }
          },
          required: ["name", "calories", "protein", "carbs", "fat", "weight"]
        }
      }
    });

    const prompt = "Analyze this image of food. Identify what it is, estimate the portion size in grams, and calculate the total calories, protein, carbs, and fat for the entire plate.";
    
    // Strip the data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    res.json(JSON.parse(text));
  } catch (error) {
    console.error('Error in Food Scanner:', error);
    res.status(500).json({ error: 'Failed to analyze food image' });
  }
});

// ==========================================
// AI WORKOUT GENERATOR ENDPOINT
// ==========================================
app.post('/api/coach/generate-routine', async (req, res) => {
  const { goal, durationMinutes, experienceLevel, equipment } = req.body;
  
  if (!goal) return res.status(400).json({ error: 'Missing workout goal' });

  console.log(`[API] Generating ${durationMinutes || 45}m ${goal} routine...`);

  if (!genAI) {
    await new Promise(r => setTimeout(r, 1500));
    return res.json({
      name: "AI Generated Push Day (Mock)",
      exercises: [
        {
          id: `ai-ex-${Date.now()}-1`,
          name: "Pushups",
          muscleGroup: "Chest",
          sets: [
            { weight: 0, reps: 15, rpe: 8, completed: false },
            { weight: 0, reps: 15, rpe: 9, completed: false }
          ]
        }
      ]
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: "A catchy name for this AI workout" },
            exercises: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING },
                  name: { type: SchemaType.STRING },
                  muscleGroup: { type: SchemaType.STRING },
                  sets: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        weight: { type: SchemaType.NUMBER },
                        reps: { type: SchemaType.NUMBER },
                        rpe: { type: SchemaType.NUMBER },
                        completed: { type: SchemaType.BOOLEAN }
                      },
                      required: ["weight", "reps", "rpe", "completed"]
                    }
                  }
                },
                required: ["id", "name", "muscleGroup", "sets"]
              }
            }
          },
          required: ["name", "exercises"]
        }
      }
    });

    const prompt = `You are an elite AI personal trainer. Create a highly optimal, customized workout routine. 
      Goal: ${goal}
      Duration: ${durationMinutes || 45} minutes
      Experience Level: ${experienceLevel || 'Intermediate'}
      Equipment Available: ${equipment || 'Full Gym'}
      
      Generate a realistic, focused workout session with appropriate exercises, sets, reps, and RPE targets. For bodyweight, set weight to 0. 
      Make sure to return it as JSON conforming to the requested schema. Generate unique string IDs for each exercise.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json(JSON.parse(text));
  } catch (error) {
    console.error('Error generating workout:', error);
    res.status(500).json({ error: 'Failed to generate workout' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 ATHLEX Backend running on http://localhost:${PORT}`);
});
