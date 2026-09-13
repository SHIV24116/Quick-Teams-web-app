import re
from typing import List, Dict, Any

class SkillMatcher:
    @staticmethod
    def tokenize(text: str) -> List[str]:
        if not text:
            return []
        # Split by commas, spaces, or slashes, remove punctuation
        cleaned = re.sub(r'[^\w\s]', ' ', text.lower())
        tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 0]
        return tokens

    @classmethod
    def calculate_score(cls, query: str, candidate: Dict[str, Any]) -> float:
        if not query:
            return 0.0

        query_tokens = cls.tokenize(query)
        if not query_tokens:
            return 0.0

        candidate_name = (candidate.get('name') or '').lower()
        candidate_username = (candidate.get('username') or '').lower()
        candidate_skills = (candidate.get('skills') or '').lower()
        candidate_about = (candidate.get('about_me') or '').lower()
        candidate_education = (candidate.get('education') or '').lower()

        score = 0.0

        # Exact ID match check
        query_strip = query.strip()
        if query_strip.isdigit() and candidate.get('id') == int(query_strip):
            score += 100.0

        candidate_skill_tokens = cls.tokenize(candidate_skills)

        for q_token in query_tokens:
            # Check skill match (highest weight)
            if q_token in candidate_skill_tokens:
                score += 30.0
            elif any(q_token in st for st in candidate_skill_tokens):
                score += 15.0

            # Check name or username
            if q_token in candidate_name or q_token in candidate_username:
                score += 20.0

            # Check bio / about me
            if q_token in candidate_about:
                score += 10.0

            # Check education
            if q_token in candidate_education:
                score += 5.0

        # Token overlap ratio bonus
        matched_skills = [t for t in query_tokens if t in candidate_skill_tokens]
        if matched_skills:
            score += (len(matched_skills) / len(query_tokens)) * 25.0

        return round(score, 2)

    @classmethod
    def rank_candidates(cls, query: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        scored = []
        for c in candidates:
            s = cls.calculate_score(query, c)
            if s > 0 or not query:
                c_copy = dict(c)
                c_copy['relevance_score'] = s
                scored.append(c_copy)

        if query:
            scored.sort(key=lambda x: x['relevance_score'], reverse=True)

        return scored
