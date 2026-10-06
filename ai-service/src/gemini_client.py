"""
Gemini API client for QishloqMed AI.
Handles API communication, retries, and error handling.
"""

import json
import logging
from typing import Optional
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


class GeminiClient:
    """Client for Google Gemini API with medical AI configuration."""

    def __init__(
        self,
        api_key: str,
        model_name: str = "gemini-3.1-flash-lite",
        max_retries: int = 2,
        timeout: int = 30,
    ):
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name
        self.max_retries = max_retries
        self.timeout = timeout
        self.candidate_models = [model_name, "gemini-3.5-flash", "gemini-flash-latest"]

    def generate(
        self,
        prompt: str,
        system_instruction: str,
        temperature: float = 0.2,
        max_output_tokens: int = 4096,
    ) -> Optional[str]:
        """
        Send prompt to Gemini and return text response.
        Low temperature (0.2) for consistent, conservative medical assessments.
        Returns None if all retries and fallback models fail.
        """
        for current_model in self.candidate_models:
            for attempt in range(self.max_retries + 1):
                try:
                    response = self.client.models.generate_content(
                        model=current_model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=temperature,
                            max_output_tokens=max_output_tokens,
                            response_mime_type="application/json",
                        ),
                    )
                    if response.text:
                        return response.text
                    logger.warning(f"Gemini ({current_model}) returned empty response (attempt {attempt + 1})")
                except Exception as e:
                    logger.error(f"Gemini API error ({current_model}, attempt {attempt + 1}/{self.max_retries + 1}): {e}")
                    if attempt == self.max_retries:
                        break
        return None

    def parse_json_response(self, response_text: str) -> Optional[dict]:
        """Parse JSON from Gemini response, handling potential formatting issues."""
        if not response_text:
            return None
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            try:
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                if start != -1 and end > start:
                    return json.loads(response_text[start:end])
            except json.JSONDecodeError:
                logger.error(f"Failed to parse Gemini JSON response: {response_text[:200]}")
                return None
        return None
