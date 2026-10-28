"""ServiceLink SQLAlchemy models.

Importing every model here registers all tables on ``Base.metadata`` so that
relationships resolve and Alembic can autogenerate migrations.
"""
from .base import Base

from .user import AccountStatus, User, UserRole
from .customer import Customer
from .provider import ApprovalStatus, Provider
from .service_category import ServiceCategory
from .service_request import RequestStatus, ServiceRequest, UrgencyLevel
from .classification_log import ClassificationLog, ClassificationStatus
from .provider_score import ProviderScore
from .quotation import Quotation, QuotationStatus
from .equipment import Equipment, EquipmentStatus
from .equipment_reservation import EquipmentReservation, ReservationStatus
from .message import Message
from .notification import DeliveryStatus, Notification, NotificationChannel
from .review import Review
from .admin_log import AdminLog

__all__ = [
    "Base",
    # models
    "User", "Customer", "Provider", "ServiceCategory", "ServiceRequest",
    "ClassificationLog", "ProviderScore", "Quotation", "Equipment",
    "EquipmentReservation", "Message", "Notification", "Review", "AdminLog",
    # enums
    "UserRole", "AccountStatus", "ApprovalStatus", "UrgencyLevel", "RequestStatus",
    "ClassificationStatus", "QuotationStatus", "EquipmentStatus",
    "ReservationStatus", "NotificationChannel", "DeliveryStatus",
]
