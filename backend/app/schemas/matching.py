from pydantic import BaseModel


class MatchResponse(BaseModel):
    requestId: int
    weights: dict[str, float]
    priceOnlyProviderIds: list[int] = []
    providers: list[dict]

