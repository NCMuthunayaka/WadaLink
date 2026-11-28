"""Initialize the master service categories used by classification and matching."""

from app.models.base import SessionLocal
from app.models.service_category import ServiceCategory


CATEGORIES = [
    ("HVAC", "Air-conditioning, refrigeration, and ventilation services."),
    ("Aluminium Glass", "Aluminium frames, windows, doors, and glass work."),
    ("Appliance Repair", "Repair and maintenance for household appliances."),
    ("Carpentry", "Woodwork, furniture, doors, and cabinetry."),
    ("Cctv Security", "CCTV, alarms, access control, and security systems."),
    ("Cleaning", "Home, office, deep-cleaning, and related services."),
    ("Construction Renovation", "Building work, renovation, and improvement projects."),
    ("Electrical", "Wiring, lighting, sockets, panels, and electrical repairs."),
    ("Event Services", "Event setup, support, and related services."),
    ("Gardening Landscaping", "Gardening, grounds care, and landscaping."),
    ("Interior Finishing", "Flooring, ceilings, tiling, and interior finishing."),
    ("It Computer Repair", "Computer, device, software, and IT support."),
    ("Locksmith", "Locks, keys, access, and door-lock services."),
    ("Masonry Tiling", "Masonry, plastering, brickwork, and tile installation."),
    ("Moving Transport", "Moving, delivery, hauling, and transport services."),
    ("Networking Internet", "Network installation, Wi-Fi, and internet support."),
    ("Painting", "Interior, exterior, decorative, and protective painting."),
    ("Pest Control", "Pest inspection, treatment, and prevention."),
    ("Plumbing", "Water supply, drainage, leaks, pipes, and plumbing repairs."),
    ("Roofing Waterproofing", "Roof repair, sealing, and waterproofing."),
    ("Solar Power", "Solar panels, inverters, batteries, and related work."),
    ("Vehicle Repair", "Vehicle inspection, maintenance, and repair."),
    ("Welding Metalwork", "Welding, fabrication, and metalwork."),
]


def main() -> None:
    db = SessionLocal()
    try:
        existing = {row.category_name.casefold(): row for row in db.query(ServiceCategory).all()}
        added = 0
        activated = 0
        for name, description in CATEGORIES:
            row = existing.get(name.casefold())
            if row is None:
                db.add(ServiceCategory(category_name=name, description=description, is_active=True))
                added += 1
            elif not row.is_active:
                row.is_active = True
                activated += 1
        db.commit()
        total = db.query(ServiceCategory).filter(ServiceCategory.is_active.is_(True)).count()
        print(f"Added {added}, activated {activated}; active categories: {total}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
