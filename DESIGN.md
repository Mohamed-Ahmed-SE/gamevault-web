---
name: GameVault
description: A dark, indexed catalog for discovering and remembering games.
colors:
  vivid-lime: "#a3e635"
  vivid-lime-soft: "#bef264"
  graphite: "#07080a"
  surface: "#0e1117"
  raised-surface: "#151821"
  paper-ink: "#f3f4f6"
  muted-ink: "#9ca3af"
  faint-ink: "#6b7280"
  divider: "rgba(255, 255, 255, 0.08)"
typography:
  display:
    fontFamily: "Manrope Variable, Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
  body:
    fontFamily: "Manrope Variable, Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
---

# Design System: GameVault

## Overview

**Creative North Star: “The Collector's Catalog”**

This visual direction follows the supplied reference: a cinematic game shelf on a graphite field, punctuated by vivid lime for actions and active states. Real game artwork carries the color and personality; the interface keeps catalog facts and private player records easy to scan.

The catalog index is functional, not a decorative texture. Preserve explicit PS2 and PS3 entry points, use only real provider artwork and metadata, and keep private player records visually distinct from public catalog content.

**Key Characteristics:**
- Graphite surfaces with vivid lime as the action and active-state color.
- Compact, indexed catalog navigation and artwork-led game discovery.
- Personal records presented as private, owner-controlled data.

## Colors

The palette pairs deep graphite surfaces and light text with a vivid lime signal.

### Primary
- **Vivid Lime**: Primary interaction accent and selected-state signal.
- **Soft Lime**: Secondary accent for emphasis against dark surfaces.

### Neutral
- **Graphite**: Global page ground.
- **Surface**: Default panel and card ground.
- **Raised Surface**: Secondary panel layer.
- **Paper Ink**: Main text color.
- **Muted Ink**: Supporting copy.
- **Faint Ink**: Low-priority labels and tertiary text.
- **Divider**: Borders and separators.

## Typography

**Display and body fonts:** Manrope Variable is imported from `@fontsource-variable/manrope/wght.css`. The `--font-sans` stack uses Manrope Variable with Manrope and system sans-serif fallbacks, and `--font-display` aliases `--font-sans`, so both body and display text use the same stack.

## Layout

The home and discovery surfaces use a dense catalog composition, with direct platform destinations and compact game rails. Detail pages pair provider-backed game information with the owner's private tracking controls. Keep page content within the existing centered content frame and let grids collapse for narrow screens rather than introducing horizontal page overflow.

## Elevation & Depth

Depth is primarily conveyed through tonal surface steps, borders, and restrained overlay treatment. Keep cards legible against the graphite ground without adding decorative shadows that compete with game artwork.

## Shapes

Use restrained rounded corners and thin dividers to distinguish controls and panels. Avoid pill-shaped containers for large content areas.

## Components

- **Primary actions:** Lime fill, dark foreground, and a clear keyboard-focus outline.
- **Secondary actions:** Dark surface with a thin neutral border; retain a visible hover and focus state.
- **Catalog cards:** Let provider artwork lead, with game metadata kept readable and labels consistently aligned.
- **Private library controls:** Make status, rating, and saved-state feedback explicit; never imply a change was saved when the request failed.

## Do's and Don'ts

- **Do** retain PS2 and PS3 as first-class navigation destinations.
- **Do** distinguish unavailable provider data from an empty catalog result.
- **Do** keep personal notes and library activity private to their owner.
- **Don't** invent catalog data or imply console-account synchronization.
- **Don't** make decorative patterns compete with the catalog index or game artwork.
