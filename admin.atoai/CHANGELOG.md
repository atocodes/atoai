# Changelog - admin.atoai

All notable changes to the `admin.atoai` application that have not yet been pushed to the remote repository.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0]

### Added

- **Sources & Channels Management Feature (`src/features/sources/`)**:
  - **Type Definitions (`src/features/sources/types/source.types.ts`)**:
    - Defined `SourceType` (`TELEGRAM`, `WEBSITE`, `OTHER`) and `SourceStatus` (`ACTIVE`, `INACTIVE`, `ARCHIVED`, `DELETED`).
    - Added data models for `Source`, `CreateSourcePayload`, `UpdateSourcePayload`, `SourceFilterOptions`, and `SourceStats`.
  - **API Service Layer (`src/features/sources/services/source.service.ts`)**:
    - Added API client functions for fetching aggregated source stats (`getStats`), paginated & filtered source list (`getSources`), individual source details (`getSource`), source creation (`createSource`), updates (`updateSource`), quick status toggling (`toggleStatus`), and deletion (`deleteSource`).
  - **Custom State Hook (`src/features/sources/hooks/useSources.ts`)**:
    - Provides centralized state management for sources: pagination, search query debouncing, type/status filtering, drawer inspection state, creation/edit modals, and error handling.
  - **UI Components**:
    - `SourceStatsGrid`: Metric cards displaying total sources, active vs. inactive status counts, and distribution across Telegram channels and websites.
    - `SourceTable`: Interactive table with real-time text search, type and status dropdown filters, color-coded status badges, quick active/inactive toggles, inspect drawer triggers, edit modal launchers, and pagination controls.
    - `SourceModal`: Dialog supporting both creation and editing of knowledge sources with conditional form fields based on source type (channel ID, username, website URL, description, and status).
    - `SourceDrawer`: Slide-over drawer to inspect full source details, configuration metadata, creation/update timestamps, and management action buttons.
  - **Feature Barrel Export (`src/features/sources/index.ts`)**:
    - Centralized exports for all types, services, hooks, and components.
- **Admin Dashboard Navigation**:
  - Added new `SOURCES` navigation tab in `AdminHeader` (`src/components/AdminHeader.tsx`) with `Layers` icon.
  - Integrated the Sources view, stats grid, table, modal, and drawer into the main admin dashboard page (`src/app/page.tsx`).
