-- Agreed MySQL schema (Week 1)
-- =====================================================================
-- ServiceLink : Complete MySQL 8.0+ Database Schema
-- Engine: InnoDB | Charset: utf8mb4
-- Tables are created in dependency order.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS servicelink
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE servicelink;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. users  (user.py)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name        VARCHAR(100)    NOT NULL,
    email            VARCHAR(255)    NOT NULL,
    password_hash    VARCHAR(255)    NOT NULL,
    phone            VARCHAR(20)     NULL,
    role             ENUM('customer','provider','admin') NOT NULL,
    account_status   ENUM('active','suspended','pending') NOT NULL DEFAULT 'pending',
    created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role_status (role, account_status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. customers  (customer.py)
-- ---------------------------------------------------------------------
CREATE TABLE customers (
    customer_id  BIGINT UNSIGNED NOT NULL,
    address      VARCHAR(255)    NULL,
    latitude     DECIMAL(10,7)   NULL,
    longitude    DECIMAL(10,7)   NULL,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id),
    CONSTRAINT fk_customers_user
        FOREIGN KEY (customer_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_customers_lat CHECK (latitude  IS NULL OR latitude  BETWEEN -90  AND 90),
    CONSTRAINT chk_customers_lng CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. providers  (provider.py)
-- ---------------------------------------------------------------------
CREATE TABLE providers (
    provider_id        BIGINT UNSIGNED NOT NULL,
    business_name      VARCHAR(150)    NULL,
    bio                TEXT            NULL,
    experience_years   INT             NOT NULL DEFAULT 0,
    hourly_rate        DECIMAL(10,2)   NULL,
    service_radius_km  DECIMAL(8,2)    NOT NULL DEFAULT 10.00,
    approval_status    ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    approved_by        BIGINT UNSIGNED NULL,
    approved_at        DATETIME        NULL,
    created_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (provider_id),
    KEY idx_providers_approval (approval_status),
    KEY idx_providers_approved_by (approved_by),
    CONSTRAINT fk_providers_user
        FOREIGN KEY (provider_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_providers_approved_by
        FOREIGN KEY (approved_by) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_providers_exp    CHECK (experience_years >= 0),
    CONSTRAINT chk_providers_rate   CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
    CONSTRAINT chk_providers_radius CHECK (service_radius_km >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. service_categories  (service_category.py)
-- ---------------------------------------------------------------------
CREATE TABLE service_categories (
    category_id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_name       VARCHAR(100)    NOT NULL,
    description         TEXT            NULL,
    parent_category_id  BIGINT UNSIGNED NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (category_id),
    UNIQUE KEY uq_service_categories_name (category_name),
    KEY idx_service_categories_parent (parent_category_id),
    CONSTRAINT fk_service_categories_parent
        FOREIGN KEY (parent_category_id) REFERENCES service_categories (category_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. service_requests  (service_request.py)
-- ---------------------------------------------------------------------
CREATE TABLE service_requests (
    request_id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    customer_id           BIGINT UNSIGNED NOT NULL,
    category_id           BIGINT UNSIGNED NULL,
    selected_provider_id  BIGINT UNSIGNED NULL,
    title                 VARCHAR(200)    NOT NULL,
    description           TEXT            NOT NULL,
    urgency               ENUM('low','medium','high','emergency') NOT NULL DEFAULT 'medium',
    address               VARCHAR(255)    NOT NULL,
    latitude              DECIMAL(10,7)   NULL,
    longitude             DECIMAL(10,7)   NULL,
    budget_min            DECIMAL(10,2)   NULL,
    budget_max            DECIMAL(10,2)   NULL,
    status                ENUM('open','assigned','in_progress','completed','cancelled') NOT NULL DEFAULT 'open',
    created_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (request_id),
    KEY idx_sr_customer (customer_id),
    KEY idx_sr_category (category_id),
    KEY idx_sr_selected_provider (selected_provider_id),
    KEY idx_sr_status_urgency (status, urgency),
    KEY idx_sr_created (created_at),
    CONSTRAINT fk_sr_customer
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sr_category
        FOREIGN KEY (category_id) REFERENCES service_categories (category_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_sr_selected_provider
        FOREIGN KEY (selected_provider_id) REFERENCES providers (provider_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_sr_budget CHECK (
        (budget_min IS NULL OR budget_min >= 0) AND
        (budget_max IS NULL OR budget_max >= 0) AND
        (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max)
    ),
    CONSTRAINT chk_sr_lat CHECK (latitude  IS NULL OR latitude  BETWEEN -90  AND 90),
    CONSTRAINT chk_sr_lng CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. classification_logs  (classification_log.py)
-- ---------------------------------------------------------------------
CREATE TABLE classification_logs (
    classification_id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id         BIGINT UNSIGNED NOT NULL,
    category_id        BIGINT UNSIGNED NULL,
    predicted_urgency  ENUM('low','medium','high','emergency') NULL,
    model_name         VARCHAR(100)    NULL,
    confidence_score   DECIMAL(5,4)    NULL,
    input_text         TEXT            NULL,
    output_json        JSON            NULL,
    status             ENUM('success','failed','fallback') NOT NULL DEFAULT 'success',
    created_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (classification_id),
    KEY idx_cl_request (request_id, created_at),
    KEY idx_cl_category (category_id),
    CONSTRAINT fk_cl_request
        FOREIGN KEY (request_id) REFERENCES service_requests (request_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cl_category
        FOREIGN KEY (category_id) REFERENCES service_categories (category_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_cl_confidence CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. provider_scores  (provider_score.py)
-- ---------------------------------------------------------------------
CREATE TABLE provider_scores (
    score_id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id           BIGINT UNSIGNED NOT NULL,
    provider_id          BIGINT UNSIGNED NOT NULL,
    rating_score         DECIMAL(6,4)    NULL,
    price_score          DECIMAL(6,4)    NULL,
    experience_score     DECIMAL(6,4)    NULL,
    distance_score       DECIMAL(6,4)    NULL,
    response_time_score  DECIMAL(6,4)    NULL,
    total_score          DECIMAL(8,4)    NOT NULL,
    rank_position        INT             NULL,
    score_explanation    JSON            NULL,
    created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (score_id),
    UNIQUE KEY uq_ps_request_provider (request_id, provider_id),
    KEY idx_ps_request_rank (request_id, rank_position),
    KEY idx_ps_provider (provider_id),
    CONSTRAINT fk_ps_request
        FOREIGN KEY (request_id) REFERENCES service_requests (request_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ps_provider
        FOREIGN KEY (provider_id) REFERENCES providers (provider_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_ps_rank CHECK (rank_position IS NULL OR rank_position >= 1)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. quotations  (quotation.py)
-- ---------------------------------------------------------------------
CREATE TABLE quotations (
    quotation_id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id                BIGINT UNSIGNED NOT NULL,
    provider_id               BIGINT UNSIGNED NOT NULL,
    proposed_price            DECIMAL(10,2)   NOT NULL,
    estimated_duration_hours  DECIMAL(8,2)    NULL,
    available_from            DATETIME        NULL,
    message                   TEXT            NULL,
    status                    ENUM('submitted','accepted','rejected','withdrawn') NOT NULL DEFAULT 'submitted',
    created_at                DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (quotation_id),
    UNIQUE KEY uq_quotation_request_provider (request_id, provider_id),
    KEY idx_q_provider (provider_id),
    KEY idx_q_status (status),
    CONSTRAINT fk_q_request
        FOREIGN KEY (request_id) REFERENCES service_requests (request_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_q_provider
        FOREIGN KEY (provider_id) REFERENCES providers (provider_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_q_price    CHECK (proposed_price >= 0),
    CONSTRAINT chk_q_duration CHECK (estimated_duration_hours IS NULL OR estimated_duration_hours >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. equipment  (equipment.py)
-- ---------------------------------------------------------------------
CREATE TABLE equipment (
    equipment_id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    owner_provider_id      BIGINT UNSIGNED NOT NULL,
    equipment_name         VARCHAR(150)    NOT NULL,
    description            TEXT            NULL,
    category               VARCHAR(100)    NULL,
    daily_rate             DECIMAL(10,2)   NOT NULL,
    deposit_amount         DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    condition_description  TEXT            NULL,
    status                 ENUM('available','reserved','unavailable','suspended') NOT NULL DEFAULT 'available',
    created_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (equipment_id),
    KEY idx_eq_owner (owner_provider_id),
    KEY idx_eq_status_category (status, category),
    CONSTRAINT fk_eq_owner
        FOREIGN KEY (owner_provider_id) REFERENCES providers (provider_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_eq_rate    CHECK (daily_rate >= 0),
    CONSTRAINT chk_eq_deposit CHECK (deposit_amount >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. equipment_reservations  (equipment_reservation.py)
-- ---------------------------------------------------------------------
CREATE TABLE equipment_reservations (
    reservation_id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    equipment_id         BIGINT UNSIGNED NOT NULL,
    renter_provider_id   BIGINT UNSIGNED NOT NULL,
    related_request_id   BIGINT UNSIGNED NULL,
    start_datetime       DATETIME        NOT NULL,
    end_datetime         DATETIME        NOT NULL,
    daily_rate_snapshot  DECIMAL(10,2)   NOT NULL,
    total_cost           DECIMAL(10,2)   NOT NULL,
    status               ENUM('pending','reserved','returned','cancelled') NOT NULL DEFAULT 'pending',
    reserved_at          DATETIME        NULL,
    returned_at          DATETIME        NULL,
    created_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reservation_id),
    KEY idx_er_equipment_dates (equipment_id, start_datetime, end_datetime),
    KEY idx_er_renter (renter_provider_id),
    KEY idx_er_request (related_request_id),
    KEY idx_er_status (status),
    CONSTRAINT fk_er_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipment (equipment_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_er_renter
        FOREIGN KEY (renter_provider_id) REFERENCES providers (provider_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_er_request
        FOREIGN KEY (related_request_id) REFERENCES service_requests (request_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_er_dates CHECK (end_datetime > start_datetime),
    CONSTRAINT chk_er_rate  CHECK (daily_rate_snapshot >= 0),
    CONSTRAINT chk_er_total CHECK (total_cost >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. messages  (message.py)
-- ---------------------------------------------------------------------
CREATE TABLE messages (
    message_id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id    BIGINT UNSIGNED NOT NULL,
    sender_id     BIGINT UNSIGNED NOT NULL,
    message_text  TEXT            NOT NULL,
    sent_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at       DATETIME        NULL,
    PRIMARY KEY (message_id),
    KEY idx_msg_request_sent (request_id, sent_at),
    KEY idx_msg_sender (sender_id),
    CONSTRAINT fk_msg_request
        FOREIGN KEY (request_id) REFERENCES service_requests (request_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_msg_sender
        FOREIGN KEY (sender_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. notifications  (notification.py)
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id             BIGINT UNSIGNED NOT NULL,
    related_request_id  BIGINT UNSIGNED NULL,
    event_type          VARCHAR(100)    NOT NULL,
    title               VARCHAR(200)    NOT NULL,
    message             TEXT            NULL,
    channel             ENUM('in_app','email') NOT NULL DEFAULT 'in_app',
    is_read             BOOLEAN         NOT NULL DEFAULT FALSE,
    delivery_status     ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at             DATETIME        NULL,
    PRIMARY KEY (notification_id),
    KEY idx_notif_user_read (user_id, is_read, created_at),
    KEY idx_notif_request (related_request_id),
    KEY idx_notif_delivery (delivery_status),
    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notif_request
        FOREIGN KEY (related_request_id) REFERENCES service_requests (request_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. reviews  (review.py)
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
    review_id    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id   BIGINT UNSIGNED NOT NULL,
    reviewer_id  BIGINT UNSIGNED NOT NULL,
    reviewee_id  BIGINT UNSIGNED NOT NULL,
    rating       TINYINT UNSIGNED NOT NULL,
    comment      TEXT            NULL,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id),
    UNIQUE KEY uq_review_request_reviewer (request_id, reviewer_id),
    KEY idx_rev_reviewee (reviewee_id),
    CONSTRAINT fk_rev_request
        FOREIGN KEY (request_id) REFERENCES service_requests (request_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rev_reviewer
        FOREIGN KEY (reviewer_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rev_reviewee
        FOREIGN KEY (reviewee_id) REFERENCES users (user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_rev_rating    CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT chk_rev_not_self  CHECK (reviewer_id <> reviewee_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 14. admin_logs  (admin_log.py)
-- ---------------------------------------------------------------------
CREATE TABLE admin_logs (
    log_id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    admin_id        BIGINT UNSIGNED NOT NULL,
    target_user_id  BIGINT UNSIGNED NULL,
    action_type     VARCHAR(100)    NOT NULL,
    target_type     VARCHAR(100)    NULL,
    target_id       BIGINT UNSIGNED NULL,
    reason          TEXT            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (log_id),
    KEY idx_al_admin (admin_id, created_at),
    KEY idx_al_target_user (target_user_id),
    KEY idx_al_target (target_type, target_id),
    CONSTRAINT fk_al_admin
        FOREIGN KEY (admin_id) REFERENCES users (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_al_target_user
        FOREIGN KEY (target_user_id) REFERENCES users (user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Rules enforced in the FastAPI backend (not expressible in plain DDL):
--  * Accepting a quotation: validate it belongs to the request/provider,
--    then update service_requests.selected_provider_id + status inside
--    one transaction (SELECT ... FOR UPDATE).
--  * Equipment reservations: check for overlapping active reservations
--    (pending/reserved) for the same equipment inside a transaction.
--  * Messages: sender must be the request's customer or selected/quoting provider.
--  * Reviews: only after status = 'completed'; reviewer and reviewee must
--    have participated in that request.
--  * users.role must match the profile table (customers / providers).
-- =====================================================================
