# Deals Page Design

**Date:** 2026-06-07

## Overview

Add a `/deals` page to the storefront that displays products from a CMS-managed Product Group with slug `deals`. The admin creates and populates the group via the existing Product Groups manager.

## Architecture

- **Page:** `apps/storefront/app/deals/page.tsx` — server component
- **Data:** `getHomepage()` → filter `productGroups` by `slug === "deals"`
- **Rendering:** Grid of `ProductCard` components with title and accent color
- **Fallback:** Empty state message "Chưa có khuyến mãi nào" if group doesn't exist or has no items
- **Admin flow:** Admin → Product Groups → create/update group with slug `deals` → add products
