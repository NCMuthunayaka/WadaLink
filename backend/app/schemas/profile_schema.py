from decimal import Decimal
from typing import ClassVar

from pydantic import BaseModel, Field, field_validator, model_validator


class _PartialUpdate(BaseModel):
    """Only fields the client actually sends are applied (see model_fields_set)."""

    NON_NULLABLE: ClassVar[tuple[str, ...]] = ()

    @model_validator(mode="after")
    def reject_null_required_fields(self):
        for name in self.NON_NULLABLE:
            if name in self.model_fields_set and getattr(self, name) is None:
                raise ValueError(f"{name} cannot be null")
        return self


class ProfileUpdate(_PartialUpdate):
    NON_NULLABLE: ClassVar[tuple[str, ...]] = ("full_name",)

    full_name: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=255)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)

    @field_validator("full_name")
    @classmethod
    def clean_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return value

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class ProviderProfileUpdate(ProfileUpdate):
    NON_NULLABLE: ClassVar[tuple[str, ...]] = (
        "full_name",
        "experience_years",
        "service_radius_km",
    )

    business_name: str | None = Field(default=None, max_length=150)
    bio: str | None = Field(default=None, max_length=5000)
    experience_years: int | None = Field(default=None, ge=0, le=100)
    hourly_rate: Decimal | None = Field(default=None, ge=0, le=Decimal("99999999.99"))
    service_radius_km: Decimal | None = Field(default=None, ge=0, le=1000)


class ProviderCategoriesUpdate(BaseModel):
    categoryIds: list[int] = Field(max_length=50)

    @field_validator("categoryIds")
    @classmethod
    def ids_must_be_positive(cls, value: list[int]) -> list[int]:
        if any(i <= 0 for i in value):
            raise ValueError("Category ids must be positive integers")
        return value


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class AccountDeleteRequest(BaseModel):
    password: str = Field(min_length=1, max_length=128)