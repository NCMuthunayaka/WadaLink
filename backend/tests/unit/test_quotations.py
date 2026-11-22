from datetime import datetime
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.main import app
from app.schemas.quotation import QuotationCreate


def test_quotation_routes_are_registered():
    paths = app.openapi()['paths']
    assert '/api/v1/quotations' in paths
    assert '/api/v1/quotations/request/{request_id}' in paths
    assert '/api/v1/quotations/request/{request_id}/select/{quotation_id}' in paths


def test_quotation_payload_validates_price_and_request():
    payload = QuotationCreate(
        request_id=4,
        proposed_price=Decimal('125.50'),
        estimated_duration_hours=Decimal('2.5'),
        available_from=datetime(2026, 11, 22, 14, 0),
        message='Materials and labour included.',
    )
    assert payload.request_id == 4
    assert payload.proposed_price == Decimal('125.50')

    with pytest.raises(ValidationError):
        QuotationCreate(request_id=0, proposed_price=-1)
