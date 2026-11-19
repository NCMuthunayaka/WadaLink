# WadaLink UI Design Guide

## Purpose

This guide defines the visual language and reusable UI rules for the WadaLink mobile application and admin interface. All team members should follow these standards when creating or modifying screens.

## Color palette

| Purpose | Color |
|---|---|
| Primary blue | `#004AC6` |
| Dark primary | `#003EA8` |
| Light primary | `#DBE1FF` |
| Secondary teal | `#006A63` |
| Light teal | `#99EFE5` |
| AI cyan | `#06B6D4` |
| Dark navy | `#0F172A` |
| App background | `#F4F8FC` |
| Card surface | `#FFFFFF` |
| Light surface | `#F1F6FA` |
| Primary text | `#131B2E` |
| Secondary text | `#434655` |
| Muted text | `#737686` |
| Border | `#E2E8F0` |
| Success | `#16A34A` |
| Warning | `#F59E0B` |
| Danger | `#DC2626` |

### Color usage

- Use blue for main actions such as Continue, Submit, Book, and Save.
- Use teal for verified providers, trusted accounts, and completed states.
- Use cyan only for AI features, smart matching, and recommendations.
- Use orange for urgent requests and warnings.
- Use green for available equipment and successful actions.
- Use red for errors, destructive actions, and cancelled states.
- Use navy for important information panels and highlighted areas.
- Avoid random colors and avoid using multiple strong accents in one component.

## Typography

Use Inter throughout the application.

| Style | Size | Usage |
|---|---:|---|
| Display | 32–40px | Landing-page hero headings |
| Large heading | 28px | Main screen titles |
| Medium heading | 22px | Section headings |
| Small heading | 18px | Card headings |
| Body large | 16px | Important descriptions |
| Body medium | 14px | Normal content |
| Body small | 12px | Helper text |
| Labels | 11–14px | Form labels and badges |

Use bold or semibold headings and regular-weight body text. Keep line height comfortable and avoid long unbroken paragraphs on mobile screens.

## Spacing system

Use a 4/8-point spacing system:

- `4px`: tiny gaps
- `8px`: icon and label spacing
- `12px`: compact spacing
- `16px`: normal screen padding
- `20px`: section spacing
- `24px`: major component spacing
- `32px`: large separation
- `48px`: page-level spacing

Use approximately `16px` horizontal padding on mobile screens.

## Reusable components

Use the shared components before creating new ones:

- `Button`
- `Card`
- `Text`
- `Input`
- `FormInput`
- `ScreenHeader`
- `StatusBadge`
- `Avatar`
- `SectionHeader`
- `LoadingState`
- `ErrorState`

Do not create custom buttons or text styles inside individual screens unless there is a documented reason.

## Button rules

- Primary: blue fill with white text.
- Secondary: light blue fill with blue text.
- Outline: transparent fill with a visible border.
- Danger: light red fill with red text.
- AI: teal-to-cyan gradient.
- Minimum touch height: `48px`.
- Standard radius: `12px`.
- Login and Register buttons must have identical dimensions.
- Use one visually dominant primary action per screen.

## Card rules

- Use a white card surface on the light blue app background.
- Use a light gray-blue border.
- Standard radius: `16px`.
- Use subtle shadows only for important or interactive cards.
- Selected cards use a blue border and clear selected-state icon.
- Dark cards use navy backgrounds with white or light text.

## Image guidance

Images should communicate a function or scenario, not fill empty space.

- Landing page: service connection illustration.
- Equipment screens: actual equipment photos.
- Provider cards: profile photos or initials fallback.
- Equipment details: larger equipment gallery image.
- Empty states: small meaningful illustrations where useful.

Avoid decorative images on login, registration, settings, and data-heavy screens.

## Mobile usability

- Minimum touch target: `44–48px`.
- Keep paragraphs short and scannable.
- Avoid placing more than two primary actions together.
- Show form errors directly below the related field.
- Use pressable information buttons instead of hover-only interactions.
- Ensure text and icons have sufficient contrast.
- Test on small and large Android screens.
- Support keyboard visibility and scrolling on all forms.
- Do not rely on color alone to communicate status; include text or icons.

## Recommended screen structure

```text
Screen background
 ├── Header
 ├── Page title and short description
 ├── Main content cards
 ├── Primary action
 └── Bottom spacing
```

## Feature-specific accents

| Feature | Recommended accent |
|---|---|
| Service request | Primary blue |
| Verified provider | Teal |
| AI classification and matching | Cyan |
| Available equipment | Green |
| Urgent request | Orange |
| Error or destructive action | Red |
| Account/profile information | Navy and teal |

## Implementation checklist

Before submitting a new screen, confirm:

- Shared theme colors are used instead of arbitrary hex values.
- Shared typography components are used.
- Buttons have consistent dimensions and accessible labels.
- Cards use the standard radius and border treatment.
- Empty, loading, error, and success states are included.
- All text fits on small screens without clipping.
- Images have a meaningful purpose and a fallback.
- The screen works with the keyboard open.
- The screen has been tested on an Android emulator.

## Source of truth

The implementation source of truth is:

```text
mobile/src/constants/theme.ts
mobile/src/components/ui/
mobile/src/components/common/
```

Update the shared theme or reusable component before adding a new one-off style.
