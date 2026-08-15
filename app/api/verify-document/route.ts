import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const documentText = body.documentText;

    if (!documentText) {
      return NextResponse.json(
        {
          success: false,
          error: "No document content was provided.",
        },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
You are the AI verification engine for PropertySure AI.

Analyze the submitted property document information carefully.

Your task is to assess:

1. Document structure
2. Data consistency
3. Signature and stamp information
4. Possible forgery or tampering indicators
5. Duplicate or suspicious information
6. Ownership-related information
7. Overall document risk

Return your assessment as JSON with exactly these fields:

{
  "noForgery": true,
  "stampValid": true,
  "signatureValid": true,
  "dataConsistent": true,
  "duplicateDetected": false,
  "ownershipValid": true,
  "trustScore": 0,
  "confidence": 0,
  "risk": "very_low",
  "summary": "",
  "findings": []
}

Important:
Do not automatically mark a document as authentic.
Base your assessment only on the information actually provided.
If there is insufficient information to verify something, say so rather than assuming it is valid.

DOCUMENT INFORMATION:

${documentText}
              `,
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      result: response.output_text,
    });
  } catch (error) {
    console.error("Verification API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "AI verification failed.",
      },
      { status: 500 }
    );
  }
}