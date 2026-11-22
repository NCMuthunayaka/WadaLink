from pydantic import BaseModel


class MatchResponse(BaseModel):
    requestId: int
    weights: dict[str, float]
    providers: list[dict]

