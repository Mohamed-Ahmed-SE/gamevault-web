---
name: GameVault
description: A dark, indexed catalog for discovering and remembering games.
colors:
  signal-orange: "#f16a43"
  signal-orange-soft: "#ff9771"
  graphite: "#0b0d10"
  surface: "#11151a"
  raised-surface: "#171c22"
  paper-ink: "#f1f0ed"
  muted-ink: "#a6a7a4"
  faint-ink: "#71757a"
  divider: "#2a2e33"
typography:
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "15px"
    lineHeight: 1.5
---

# Design System: GameVault

## Overview

**Creative North Star: “The Collector's Catalog”**

This visual direction is inferred from the supplied surface brief and the existing interface: a practical collector's index with warm paper-like foregrounds on a graphite field. Game artwork carries the color and personality; the interface stays restrained so platform shortcuts, catalog facts, and personal records remain easy to scan.

The catalog index is functional, not a decorative texture. Preserve explicit PS2 and PS3 entry points, use only real provider artwork and metadata, and keep private player records visually distinct from public catalog content.

**Key Characteristics:**
- Graphite surfaces with a restrained orange action color.
- Compact, indexed catalog navigation and artwork-led game discovery.
- Personal records presented as private, owner-controlled data.

## Colors

The palette pairs deep graphite surfaces and warm light text with a small, purposeful orange signal.

### Primary
- **Signal Orange**: Primary interaction accent and selected-state signal.
- **Soft Signal Orange**: Secondary accent for emphasis against dark surfaces.

### Neutral
- **Graphite**: Global page ground.
- **Surface**: Default panel and card ground.
- **Raised Surface**: Secondary panel layer.
- **Paper Ink**: Main text color.
- **Muted Ink**: Supporting copy.
- **Faint Ink**: Low-priority labels and tertiary text.
- **Divider**: Borders and separators.

## Typography

**Display Font:** Arial, Helvetica, sans-serif (current implementation)
**Body Font:** Arial, Helvetica, sans-serif

**Character:** The current implementation uses a compact sans-serif voice for catalog density. The display face remains a known refinement opportunity; avoid treating this current choice as an immutable brand commitment.

## Layout

The home and discovery surfaces use a dense catalog composition, with direct platform destinations and compact game rails. Detail pages pair provider-backed game information with the owner's private tracking controls. Keep page content within the existing centered content frame and let grids collapse for narrow screens rather than introducing horizontal page overflow.

## Elevation & Depth

Depth is primarily conveyed through tonal surface steps, borders, and restrained overlay treatment. Keep cards legible against the graphite ground without adding decorative shadows that compete with game artwork.

## Shapes

Use restrained rounded corners and thin dividers to distinguish controls and panels. Avoid pill-shaped containers for large content areas.

## Components

- **Primary actions:** Orange fill, dark foreground, and a clear keyboard-focus outline.
- **Secondary actions:** Dark surface with a thin neutral border; retain a visible hover and focus state.
- **Catalog cards:** Let provider artwork lead, with game metadata kept readable and labels consistently aligned.
- **Private library controls:** Make status, rating, and saved-state feedback explicit; never imply a change was saved when the request failed.

## Do's and Don'ts

- **Do** retain PS2 and PS3 as first-class navigation destinations.
- **Do** distinguish unavailable provider data from an empty catalog result.
- **Do** keep personal notes and library activity private to their owner.
- **Don't** invent catalog data or imply console-account synchronization.
- **Don't** make decorative patterns compete with the catalog index or game artwork.
