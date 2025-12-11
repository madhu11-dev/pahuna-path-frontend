```bash
git add src/components/ConfirmationModal.jsx
git commit -m "Added reusable ConfirmationModal component"

git add src/components/admin/AdminLoadingSpinner.jsx src/components/admin/AdminPageHeader.jsx src/components/admin/AdminPageLayout.jsx src/components/admin/AdminSearchBar.jsx src/components/admin/AdminSidebar.jsx
git commit -m "Added admin layout and UI components"

git add src/components/user/LoadingSpinner.jsx src/components/user/EmptyState.jsx src/components/user/PageContainer.jsx src/components/user/SectionCard.jsx src/components/user/StatusBadge.jsx
git commit -m "Added user UI utility components"

git add src/components/user/SearchBar.jsx src/components/user/FilterBar.jsx src/components/user/RangeSlider.jsx src/components/user/LocationButton.jsx src/components/user/LocationSort.jsx
git commit -m "Added user search and filter components"

git add src/components/user/PlaceCard.jsx src/components/user/AccommodationCard.jsx src/components/user/AddPlaceModal.jsx
git commit -m "Added user place and accommodation card components"

git add src/components/staff/AccommodationsList.jsx src/components/staff/RoomsManagement.jsx src/components/staff/ServicesManagement.jsx
git commit -m "Added staff management components"

git add src/components/staff/BookingDetailsModal.jsx src/components/staff/VerificationPaymentModal.jsx
git commit -m "Added staff booking and payment modal components"

git add src/components/user/UserNavbar.jsx
git commit -m "Updated UserNavbar component"

git add src/components/staff/BookingCalendar.jsx src/components/staff/TransactionsList.jsx
git commit -m "Refactored staff BookingCalendar and TransactionsList"

git add src/components/AccommodationDetailModal.jsx src/components/RoomManagement.jsx src/components/ExtraServiceManagement.jsx
git commit -m "Refactored accommodation, room and service modals"

git add src/pages/Admin/AdminDashboard.jsx
git commit -m "Refactored AdminDashboard with new layout"

git add src/pages/Admin/AdminUsers.jsx src/pages/Admin/AdminStaff.jsx
git commit -m "Refactored admin users and staff pages, removed view details icon"

git add src/pages/Admin/AdminPlaces.jsx src/pages/Admin/AdminAccommodations.jsx
git commit -m "Refactored admin places and accommodations pages"

git add src/pages/Staff/StaffDashboard.jsx
git commit -m "Refactored StaffDashboard with modular components"

git add src/pages/user/Feedpage.jsx src/pages/user/Accommodations.jsx
git commit -m "Refactored user feed and accommodations pages"

git add src/pages/user/MyBookings.jsx
git commit -m "Updated MyBookings page UI"

git add src/apis/Api.js
git commit -m "Updated API endpoints"

git add tailwind.config.js
git commit -m "Updated Tailwind config with new colors and animations"

git push origin refactorr
```

PR Title: Refactor UI components and admin/staff/user pages

PR Description:
This PR implements a comprehensive refactoring of the frontend codebase to improve code organization, maintainability, and user experience.

**Component Reorganization**
- Created reusable `ConfirmationModal` component for delete confirmations
- Added admin-specific layout components (`AdminPageLayout`, `AdminPageHeader`, `AdminSidebar`, `AdminSearchBar`, `AdminLoadingSpinner`)
- Added user UI utility components (`LoadingSpinner`, `EmptyState`, `PageContainer`, `SectionCard`, `StatusBadge`)
- Added user interaction components (`SearchBar`, `FilterBar`, `RangeSlider`, `LocationButton`, `LocationSort`)
- Added card components (`PlaceCard`, `AccommodationCard`, `AddPlaceModal`)
- Added staff management components (`AccommodationsList`, `RoomsManagement`, `ServicesManagement`, `BookingDetailsModal`, `VerificationPaymentModal`)

**Admin Pages Refactoring**
- Refactored `AdminDashboard` with new modular layout
- Refactored `AdminUsers` and `AdminStaff` pages, removed "view details" eye icon
- Refactored `AdminPlaces` and `AdminAccommodations` pages with improved UI

**Staff Pages Refactoring**
- Completely refactored `StaffDashboard` using modular components
- Updated `BookingCalendar` and `TransactionsList` with better organization

**User Pages Refactoring**
- Refactored `Feedpage` and `Accommodations` with new card components
- Updated `MyBookings` page UI
- Updated `UserNavbar` component

**Other Changes**
- Refactored accommodation, room, and service management modals
- Updated API endpoints in `Api.js`
- Enhanced Tailwind config with new color schemes and animations

**Impact**
- Improved code reusability through component extraction
- Better separation of concerns
- Enhanced UI consistency across admin, staff, and user interfaces
- Reduced code duplication
- Improved maintainability and scalability
