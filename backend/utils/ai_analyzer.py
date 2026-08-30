import os
import json
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def analyze_resume(text):

    prompt = f"""
You are an expert ATS Resume Analyzer.

Analyze the resume below.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "ats_score": 85,
    "skills": [
        "Python",
        "React",
        "MongoDB"
    ],
    "strengths": [
        "Strong technical skills",
        "Good project experience"
    ],
    "weaknesses": [
        "Resume lacks measurable achievements"
    ],
    "suggestions": [
        "Add measurable project results",
        "Improve resume summary"
    ]
}}

Rules:

1. ats_score must be between 0 and 100.
2. skills must be a list.
3. strengths must be a list.
4. weaknesses must be a list.
5. suggestions must be a list.
6. Do not return markdown.
7. Do not use ```json.
8. Return JSON only.

Resume:

{text}
"""

    max_attempts = 3

    for attempt in range(max_attempts):

        try:

            response = client.models.generate_content(
                model="models/gemini-3.5-flash",
                contents=prompt
            )

            result = response.text.strip()

            # Remove markdown if Gemini adds it
            result = result.replace(
                "```json",
                ""
            )

            result = result.replace(
                "```",
                ""
            )

            result = result.strip()

            analysis = json.loads(result)

            # Make sure required fields exist
            analysis.setdefault(
                "ats_score",
                0
            )

            analysis.setdefault(
                "skills",
                []
            )

            analysis.setdefault(
                "strengths",
                []
            )

            analysis.setdefault(
                "weaknesses",
                []
            )

            analysis.setdefault(
                "suggestions",
                []
            )

            return analysis

        except json.JSONDecodeError:

            print(
                "Gemini returned invalid JSON."
            )

            return {
                "ats_score": 0,
                "skills": [],
                "strengths": [],
                "weaknesses": [],
                "suggestions": [
                    "AI returned an invalid response. Please analyze the resume again."
                ]
            }

        except Exception as error:

            print(
                f"Gemini attempt {attempt + 1} failed:"
            )

            print(error)

            # Try again unless this was the final attempt
            if attempt < max_attempts - 1:

                print(
                    "Retrying Gemini..."
                )

                time.sleep(2)

            else:

                return {
                    "ats_score": 0,
                    "skills": [],
                    "strengths": [],
                    "weaknesses": [],
                    "suggestions": [
                        "AI service is temporarily unavailable. Please try again later."
                    ]
                }