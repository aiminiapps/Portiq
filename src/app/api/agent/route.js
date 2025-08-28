import { NextResponse } from 'next/server';
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.YOUR_SITE_URL,
    'X-Title': process.env.YOUR_SITE_NAME,
  },
});

export async function POST(request) {
  try {
    // Parse the request body
    const { messages } = await request.json();
    
    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }
    
    const response = await openai.chat.completions.create({
      model: 'meta-llama/llama-4-maverick',
      messages,
      max_tokens: 1000
    });
    
    return NextResponse.json({ 
      reply: response.choices[0].message.content 
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    
    let errorMessage = err.message;
    let errorDetails = {};
    
    if (err.response) {
      errorDetails = {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data
      };
    }
    
    return NextResponse.json(
      { 
        error: "Failed to get AI response", 
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
