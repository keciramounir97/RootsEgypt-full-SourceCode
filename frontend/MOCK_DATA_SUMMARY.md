# Mock Data Summary - Roots Egypt

## Overview
Comprehensive mock data has been prepared for all features in the Roots Egypt application. All data is ready to use in development/prototype mode.

---

## 📊 Complete Mock Data Inventory

### 1. **Audio/Podcasts** (`MOCK_AUDIO`)
- **Count**: 12 audio files
- **Categories**: Genealogy Guides, Oral History, Research Skills, Social History, Religious Heritage, Tribal Studies, Royalty & Politics, Ancient History, Linguistics, Archives & Records, Genetic Genealogy, Classical History
- **Features**: Duration, play counts, likes, cover images, file sizes
- **Sample Titles**:
  - "Tracing Your Egyptian Roots: An Introduction"
  - "The Nubian Oral History Project"
  - "Reading Ottoman Arabic Documents"
  - "DNA Testing for Egyptian Ancestry"

### 2. **Contact Form Submissions** (`MOCK_CONTACT_SUBMISSIONS`)
- **Count**: 8 submissions
- **Statuses**: pending, responded, resolved
- **Sample Topics**:
  - Ottoman archives access requests
  - Nubian family records contributions
  - Coptic church records inquiries
  - Technical support issues
  - Partnership opportunities
  - Academic research collaboration

### 3. **Research Resources** (`MOCK_RESEARCH_RESOURCES`)
- **Count**: 12 major archives/institutions
- **Categories**: Archives, Religious Archives, Digital Archives, Libraries, Community Archives, Museums, International Archives
- **Key Resources**:
  - Dar Al-Wathaeq Al-Qawmiya (Egyptian National Archives)
  - Başbakanlık Osmanlı Arşivi (Ottoman State Archives, Istanbul)
  - Coptic Orthodox Patriarchate Archives
  - Oxyrhynchus Papyri Project (Oxford)
  - Cairo Geniza Project
  - British Library - Middle East Collections
  - Nubian Heritage Documentation Project
  - Sinai Tribal Documentation Center
- **Details Included**: Location, address, website, email, phone, access info, holdings

### 4. **Historical Periods** (`MOCK_PERIODS`)
- **Count**: 8 major periods
- **Timeline**: 3100 BCE to Present (2026)
- **Periods**:
  1. **Pharaonic Egypt** (3100 BCE - 332 BCE)
  2. **Ptolemaic Period** (332 BCE - 30 BCE)
  3. **Roman Egypt** (30 BCE - 641 CE)
  4. **Islamic Conquest & Early Islamic Period** (641 CE - 1250 CE)
  5. **Mamluk Sultanate** (1250 - 1517)
  6. **Ottoman Egypt** (1517 - 1882)
  7. **Khedivate & British Occupation** (1882 - 1952)
  8. **Modern Egypt** (1952 - Present)
- **Each Period Includes**:
  - Name (English & Arabic)
  - Date range
  - Description
  - Genealogical sources
  - Key archives
  - Notable records
  - Research challenges
  - Color code & icon

---

## 🔄 API Endpoints Added to `mockApi.ts`

### Audio Endpoints
- `GET /audio` - List all audio files
- `GET /audio/:id` - Get single audio file
- `GET /admin/audio` - Admin view of all audio
- `POST /audio` - Upload new audio
- `PUT /audio/:id` - Update audio
- `DELETE /audio/:id` - Delete audio
- `POST /audio/:id/play` - Increment play count
- `POST /audio/:id/like` - Like/unlike audio

### Contact Endpoints
- `GET /admin/contact` - List all contact submissions
- `GET /contact/:id` - Get single submission
- `POST /contact` - Submit contact form
- `PUT /admin/contact/:id` - Update submission status
- `DELETE /admin/contact/:id` - Delete submission

### Research Resources Endpoints
- `GET /resources` - List all resources (supports `?category=` filter)
- `GET /resources/:id` - Get single resource
- `GET /admin/resources` - Admin view
- `POST /admin/resources` - Add new resource
- `PUT /admin/resources/:id` - Update resource
- `DELETE /admin/resources/:id` - Delete resource

### Historical Periods Endpoints
- `GET /periods` - List all periods
- `GET /periods/:id` - Get single period
- `GET /admin/periods` - Admin view
- `POST /admin/periods` - Add new period
- `PUT /admin/periods/:id` - Update period
- `DELETE /admin/periods/:id` - Delete period

---

## 📦 Previously Existing Mock Data

### Users & Authentication
- `MOCK_USERS` - 3 test users (Admin, Member, Researcher)
- `MOCK_USERS_LIST` - 10 users for admin panel
- `MOCK_TOKEN` & `MOCK_REFRESH_TOKEN`

### Family Trees
- `MOCK_TREES` - 7 family trees with full GEDCOM data
  - Al-Masry Family Tree (Cairo)
  - Hassan-Ibrahim Family (Alexandria)
  - Al-Said Family (Luxor)
  - Idris Family (Nubian Heritage)
  - Khalil Family (Coptic Lineage)
  - Bey Family (Ottoman Cairo 1720-1890)
  - Aurelius Family (Greco-Roman Alexandria 30 BCE - 350 CE)

### Books & Documents
- `MOCK_BOOKS` - 16 books/documents covering genealogy guides, archives, and historical records

### Gallery
- `MOCK_GALLERY` - 28 heritage images (family portraits, historical sites, documents, manuscripts)

### Articles
- `MOCK_ARTICLES` - 8 articles with full content
- `MOCK_ARTICLE_COMMENTS` - Comments on articles
- `MOCK_ARTICLE_LIKE_COUNTS` - Like counts per article
- `MOCK_ARTICLE_SHARE_COUNTS` - Share counts per article

### Admin Data
- `MOCK_STATS` - Dashboard statistics
- `MOCK_ACTIVITY` - 12 activity log entries
- `MOCK_ROLES` - 3 user roles
- `MOCK_NOTIFICATIONS` - 4 notifications

### Search
- `MOCK_SEARCH_TREES` - 5 trees for search results
- `MOCK_SEARCH_PEOPLE` - 8 people for search results

---

## 🚀 Usage

### Enabling Mock Mode
Mock mode is **enabled by default** in development. To toggle:

```javascript
// Disable mock mode (use real backend)
localStorage.setItem("rootsegypt_mock_mode", "false");

// Enable mock mode
localStorage.setItem("rootsegypt_mock_mode", "true");
// or
localStorage.removeItem("rootsegypt_mock_mode");
```

### Importing Mock Data
```typescript
import {
  MOCK_AUDIO,
  MOCK_CONTACT_SUBMISSIONS,
  MOCK_RESEARCH_RESOURCES,
  MOCK_PERIODS,
  // ... other mock data
} from '@/lib/mockData';
```

### API Usage
All API calls through the configured axios instance will automatically use mock data when in mock mode:

```typescript
import api from '@/lib/api';

// These will return mock data in mock mode
const audio = await api.get('/audio');
const resources = await api.get('/resources?category=Archives');
const periods = await api.get('/periods');
const contact = await api.post('/contact', formData);
```

---

## 📝 Notes

1. **Realistic Data**: All mock data includes realistic Egyptian names, locations, dates, and historical context
2. **Complete Coverage**: Every feature now has comprehensive mock data
3. **Ready for Development**: No backend required for frontend development
4. **Easy Testing**: Test all features with realistic data scenarios
5. **Bilingual Support**: Historical periods include Arabic names (nameAr field)
6. **Rich Metadata**: All resources include contact info, access details, and holdings information

---

## 🎯 Next Steps

The application is now fully prepared with mock data for:
- ✅ Audio/Podcasts page
- ✅ Contact Us form
- ✅ Research Resources page
- ✅ Historical Periods/Timeline page
- ✅ All existing features (Trees, Books, Gallery, Articles, etc.)

You can now develop and test all frontend features without requiring a backend connection!
