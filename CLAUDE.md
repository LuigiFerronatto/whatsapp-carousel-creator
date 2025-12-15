# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WhatsApp Carousel Creator is a React application for creating interactive carousel message templates for the Blip Router through the WhatsApp Business API. The app walks users through a three-step process to upload media files, configure cards with interactive buttons, and send the templates via the Blip messaging platform.

## Commands

### Development
```bash
npm start              # Start development server
npm run build         # Build for production (CI=false to skip warnings as errors)
npm test              # Run tests in watch mode
```

### Environment Variables

The app requires these environment variables (typically in `.env` file):
- `REACT_APP_AZURE_STORAGE_ACCOUNT_NAME` - Azure Blob Storage account name
- `REACT_APP_AZURE_SAS_TOKEN` - Azure SAS token for blob storage
- `REACT_APP_AZURE_CONTAINER_NAME` - Container name (defaults to 'uploads')

## Architecture

### State Management Pattern

The application uses a **composition-based hook architecture** that breaks template state into focused, reusable hooks rather than a monolithic context:

- **`useWhatsAppTemplate`** (src/hooks/template/useWhatsAppTemplate.js) - Master hook that composes all sub-hooks
- **`useTemplateState`** - Core state (step, cards, auth key, template name, etc.)
- **`useCardManagement`** - Card operations (add, remove, update)
- **`useButtonManagement`** - Button operations for each card
- **`useValidation`** - Validation logic for template data
- **`useDraftManager`** - LocalStorage persistence for draft recovery
- **`useTemplatePersistence`** - Template creation flow coordination
- **`useStepsValidation`** - Multi-step form validation

This state is made available app-wide via `WhatsAppTemplateContext` (src/contexts/WhatsAppTemplateContext.js).

### Three-Step User Flow

1. **Step One** (src/components/steps/StepOne.js): File upload and authentication
   - User provides Router Key (Blip authorization key)
   - Selects 2-10 cards and uploads images/videos for each
   - Files are uploaded to Azure Blob Storage
   - File handles are stored in card state

2. **Step Two** (src/components/steps/StepTwo.js): Card content configuration
   - Configure body text for each card (max 160 chars)
   - Add interactive buttons (1-2 per card)
   - Button types: QUICK_REPLY, URL, PHONE_NUMBER
   - Real-time character counting and validation

3. **Step Three** (src/components/steps/StepThree.js): Template creation and preview
   - Preview final carousel with all cards
   - Generate template JSON in Blip/WhatsApp format
   - Submit template to Blip API via `/message-templates` endpoint
   - Export JSON for use in Blip Builder

### Service Layer

**API Services** (src/services/api/):
- `apiConfig.js` - Base URL and header configuration
- `apiUploadFiles.js` - File upload to Blip API (returns file handles)
- `apiCreateTemplate.js` - Template creation via Blip commands endpoint
- `apiSendTemplate.js` - Send template message to phone number
- All API calls require Router Key in Authorization header

**Storage Services**:
- `azureBlobService.js` - Azure Blob Storage integration for media files
  - Uses `@azure/storage-blob` SDK
  - Handles SAS token authentication
  - Validates container existence before upload
  - Returns public URLs for uploaded files

- `localStorageService.js` - Draft persistence in browser LocalStorage
  - Saves template state for recovery after refresh
  - Preserves file handles (critical for Step 2 navigation)

**Validation Services** (src/services/validation/):
- `validationService.js` - General validation (file types, sizes, phone numbers)
- `validationCreateTemplate.js` - Template-specific validation and API response parsing

### Alert System

The app uses a centralized alert system via `AlertServiceContext`:
- `AlertProvider` (src/components/ui/AlertMessage/AlertContext.js) - Lower-level context
- `AlertServiceProvider` (src/contexts/AlertServiceContext.js) - Higher-level service wrapper
- Provides typed alerts: `alert.success()`, `alert.error()`, `alert.warning()`, `alert.info()`
- Supports message keys from textContent.json for i18n consistency

### Data Flow: File Upload to Template Creation

1. User selects media files in Step One → Files validated (type, size)
2. Files uploaded to Azure Blob Storage → Returns public URLs
3. URLs uploaded to Blip API `/media-upload` → Returns file handles
4. Handles stored in card state: `card.fileHandle`, `card.fileUrl`, `card.fileType`
5. In Step Three, handles used in template JSON `header_handle` field
6. Template submitted to `/commands` endpoint with complete carousel structure
7. Three JSON outputs generated:
   - `templateJson` - Template creation request
   - `sendTemplateJson` - Send message format
   - `builderTemplateJson` - Blip Builder dynamic content format

### File Handle Persistence

**Critical**: When navigating between steps, file handles must be preserved:
- Draft manager saves state with handles to localStorage
- Step transition from 1→2 triggers `saveCurrentState()` to preserve handles
- Without handles, users must re-upload files (poor UX)
- See `useWhatsAppTemplate.js:95-115` for the save effect

## Deployment

The app deploys to Azure Static Web Apps with custom routing:
- Base path: `/apps/whatsapp-carousel-creator`
- SPA routing configured in `staticwebapp.config.json`
- All routes rewrite to index.html for client-side routing
- Build script sets `CI=false` to bypass warning-as-error in deployment

## UI Component System

Uses CSS Modules with a design system (src/styles/design-system.css):
- Reusable components in src/components/ui/
- Most components accept variant, size, and color props
- Uses react-icons (Fi* prefix for Feather icons)
- Framer Motion for animations

## Testing

Testing framework is Jest with React Testing Library:
- No test files currently exist in the repository
- Test command configured: `npm test`
- When adding tests, place in `__tests__` folders or use `.test.js` suffix
