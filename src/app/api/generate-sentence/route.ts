import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// 타입 정의 추가
type OpenAIResponse = {
  choices: Array<{
    message?: {
      content: string;
    };
  }>;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Generate a sentence in both English and Korean to facilitate language learning.

# Output Format
- Provide a single sentence in English followed by its Korean translation.
- Ensure both translations are clear and accurate.

# Examples
**Example 1:**
- **Input:** A simple sentence request.
- **Output:** "The weather is nice today." / "오늘 날씨가 좋다."

# Notes
- Consider common learning themes like daily activities, simple descriptions, or basic conversation topics.
- Ensure the sentences are suitable for beginners or intermediate language learners.`
        },
        {
          role: "user",
          content: "Generate a new sentence pair."
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the response to extract English and Korean sentences
    const [en, ko] = response.split('/').map((s: string) => s.trim());

    return NextResponse.json({ en, ko });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate sentence' },
      { status: 500 }
    );
  }
} 