import json
import os
from openai import OpenAI
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

intro_prompt = """
This application evaluates user-generated prompts and provides structured suggestions for improving clarity, specificity, context, and format.

Additionally, it generates a short, engaging summary that offers an opinionated or sassy take on the quality of the prompt. 
The goal is to provide users with actionable and useful feedback while keeping responses lively and engaging.

You're goal is to provide helpful suggestions, a short and engaging summary, and a rewritten version of the ORIGINAL prompt.

The user may submit a prompt that's in the middle of a sentence or a question. If so, please rewrite the prompt as a complete question 
and acknowledge that you may have caught them mid-conversation but that you've rewritten it as a question.

Example Rewrites:
- Original: "Tell me about AI."
  Rewrite: "What are the major aspects of artificial intelligence, including its history, applications, and future potential?"

- Original: "How to make money fast?"
  Rewrite: "What are some fast ways to generate income legally and efficiently?"

- Original: "Write a poem about the moon."
  Rewrite: "Write a poem about the moon, focusing on its beauty, influence, or symbolism in any poetic style of your choice."

- Original: "Yeah, I want to make money fast."
  Rewrite: "Yeah, I want to make money fast. What are some fast ways to generate income legally and efficiently?"

- Original: "I just fixed some issues in the codebase."
  Rewrite: "I just fixed some issues in the codebase. What are the specific issues and how did you fix them?"
"""

example_summaries = """
Below are some example summaries based on different types of user prompts:

Example 1:
- User Prompt: "Tell me about AI."
- Summary: "Vague much? AI is a massive topic— we should narrow it down a bit. What aspect? Ethics? History? How it's going to take your job? :P"

Example 2:
- User Prompt: "Write a poem about the moon."
- Summary: "Romantic or scientific? Haiku or free verse? We should give some direction before starting to rhyme 'June' with 'moon'."

Example 3:
- User Prompt: "How to make money fast?"
- Summary: "Ah yes, the eternal question. Do you want legit ways or the 'risk-it-all-on-crypto' guide? I would be more specific."
"""

additional_instruction = """
Also, please do not include extra quotes around returned strings
"""

BASE_SYSTEM_PROMPT = f"""
{intro_prompt}

{example_summaries}

{additional_instruction}
"""

REGENERATION_SYSTEM_PROMPT = """
{intro_prompt}

The user has chosen to regenerate their prompt based on previous suggestions. They've incorporated the following feedback:

{previous_suggestions}

Please analyze their revised prompt and provide new suggestions for further improvement.

Keep the tone engaging and constructive.

{example_summaries}
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
    tone: Optional[List[str]] = Field(
        ...,
        description="Optional suggestions to improve the tone of the prompt along with a brief explanation",
    )
    clarity: Optional[List[str]] = Field(
        ...,
        description="Optional suggestions to improve the clarity of the prompt text along with a brief explanation",
    )
    specificity: Optional[List[str]] = Field(
        ...,
        description="Optional suggestions to make the prompt more specific along with a brief explanation",
    )
    context: Optional[List[str]] = Field(
        ...,
        description="Optional suggestions to improve the context and coherence of the prompt along with a brief explanation",
    )
    format: Optional[List[str]] = Field(
        ...,
        description="Optional suggestions to improve the formatting and structure of the prompt along with a brief explanation",
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
        description="A short summary of your prompt suggestion analysis that will be displayed to the user; feel free to add a bit of personality for flavor. Please do not include extra quotes in returned strings.",
    )
    rewrite: str = Field(
        ...,
        description="A rewritten version of the input text with your improvements applied. Please do not include extra quotes in returned strings and remember that the user is not asking you a question-- they are writing a question and you are providing a suggested rewrite of the original prompt",
    )


def format_previous_suggestions(suggestions: dict) -> str:
    formatted = []
    for category, items in suggestions.items():
        if items:
            formatted.append(f"\n{category.title()}:")
            formatted.extend(f"- {item}" for item in items)
    if not formatted:
        return "Sorry, actually they didn't select any suggestions."
    return "\n".join(formatted)


def get_suggestions(prompt: str, selected_suggestions: Optional[dict] = None):
    """
    Get suggestions from LLM with retry logic and schema validation
    """
    try:
        if selected_suggestions:
            formatted_suggestions = format_previous_suggestions(selected_suggestions)
            system_prompt = REGENERATION_SYSTEM_PROMPT.format(
                intro_prompt=intro_prompt,
                previous_suggestions=formatted_suggestions,
                example_summaries=example_summaries,
            )
        else:
            system_prompt = BASE_SYSTEM_PROMPT

        response = client.beta.chat.completions.parse(
            model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
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
        selected_suggestions = body.get("selectedSuggestions")

        if not prompt:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No prompt provided"}),
            }

        response = get_suggestions(prompt, selected_suggestions)

        if response.get("status") in ["refusal", "error"]:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": response.get("message")}),
            }

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps(response["data"]),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(
                {"error": f"Failed to generate valid suggestions: {str(e)}"}
            ),
        }
