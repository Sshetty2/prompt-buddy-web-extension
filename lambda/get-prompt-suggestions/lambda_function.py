import json
import os
from openai import OpenAI
from typing import List
from pydantic import BaseModel, Field
from enum import Enum

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

SYSTEM_PROMPT_FEW_SHOT = """
This application evaluates user-generated prompts and provides structured suggestions for improving clarity, specificity, context, and format.

Additionally, it generates a short, engaging summary that offers an opinionated or sassy take on the quality of the prompt. The goal is to provide users with actionable and useful feedback while keeping responses lively and engaging.

Below are some example summaries based on different types of user prompts:

Example 1:
- User Prompt: "Tell me about AI."
- Summary: "Vague much? AI is a massive topic— we should narrow it down a bit. What aspect? Ethics? History? How it’s going to take your job? :P"

Example 2:
- User Prompt: "Write a poem about the moon."
- Summary: "Romantic or scientific? Haiku or free verse? We should give some direction before starting to rhyme ‘June’ with ‘moon’."

Example 3:
- User Prompt: "How to make money fast?"
- Summary: "Ah yes, the eternal question. Do you want legit ways or the ‘risk-it-all-on-crypto’ guide? I would be more specific."

Now, please analyze the given user prompt and provide a similarly engaging summary along with structured suggestions for improvement of the user's prompt.
"""


class ToneType(str, Enum):
    FORMAL = "formal"
    INFORMAL = "informal"
    TECHNICAL = "technical"
    CASUAL = "casual"
    CONFUSED = "confused"
    AGGRESSIVE = "aggressive"
    FRIENDLY = "friendly"
    PROFESSIONAL = "professional"
    ACADEMIC = "academic"


class Suggestions(BaseModel):
    tone: List[str] = Field(
        ..., description="Suggestions to improve tone of the prompt"
    )
    clarity: List[str] = Field(
        ..., description="Suggestions to improve clarity of the prompt text"
    )
    specificity: List[str] = Field(
        ..., description="Suggestions to make the prompt more specific"
    )
    context: List[str] = Field(
        ..., description="Suggestions to improve context and coherence of the prompt"
    )
    format: List[str] = Field(
        ..., description="Suggestions to improve formatting and structure of the prompt"
    )


class StructuredResponse(BaseModel):
    suggestions: Suggestions = Field(
        ..., description="A set of suggestions to improve the input text."
    )
    current_tone: List[str] = Field(
        ...,
        description="Current tone assessment (can be multiple: e.g., ['confused', 'informal'])",
    )
    summary: str = Field(
        ...,
        description="A short summary of your prompt suggestion analysis that will be displayed to the user; feel free to add a bit of personality for flavor.",
    )
    rewrite: str = Field(
        ...,
        description="A rewritten version of the input text with improvements applied.",
    )


def get_suggestions(prompt):
    """
    Get suggestions from OpenAI with retry logic and schema validation
    """
    try:
        response = client.beta.chat.completions.parse(
            model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT_FEW_SHOT,
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            response_format=StructuredResponse,
        )

        agent_response = response.choices[0].message
        suggestions = agent_response.parsed
        refusal = agent_response.refusal

        if refusal:
            return {
                "status": "refusal",
                "message": refusal,
            }

        return {
            "status": "success",
            "data": suggestions.model_dump(),
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to generate valid suggestions: {str(e)}",
        }


def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        prompt = body.get("prompt")

        if not prompt:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No prompt provided"}),
            }

        response = get_suggestions(prompt)

        if response.get("status") == "refusal" or response.get("status") == "error":
            return {
                "statusCode": 400,
                "body": json.dumps({"error": response.get("message")}),
            }

        suggestions = response["data"]

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps(suggestions),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(
                {"error": f"Failed to generate valid suggestions: {str(e)}"}
            ),
        }
