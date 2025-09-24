// ---------------------------
// Heroicons set for RSS Reader
// ---------------------------

import {
  ArrowPathIcon,           // refresh
  PlusCircleIcon,         // add feed
  Cog6ToothIcon,          // settings
  BookmarkIcon,           // mark favorite
  CheckCircleIcon,        // mark read
  EllipsisHorizontalCircleIcon, // unread indicator (using this instead of CircleIcon which doesn't exist)
  MagnifyingGlassIcon,    // search
  FolderIcon,             // category/folder
  ChevronLeftIcon,        // back / navigation
  ExclamationTriangleIcon, // error / fetch failed
  WifiIcon,               // offline indicator
  MoonIcon,               // dark mode
  SunIcon,                // light mode
  UserIcon,               // user profile
  ArrowRightOnRectangleIcon, // logout
  ChevronDownIcon,        // dropdown
  EyeIcon,                // show password
  EyeSlashIcon,           // hide password
  EnvelopeIcon,           // email
  LockClosedIcon,         // password
  ExclamationCircleIcon,  // alert/error
  PlusIcon,               // simple plus
  AdjustmentsHorizontalIcon, // filters
  FunnelIcon,             // filter
} from '@heroicons/react/24/outline';

// Example usage mapping
export const Icons = {
  refresh: ArrowPathIcon,
  addFeed: PlusCircleIcon,
  settings: Cog6ToothIcon,
  favorite: BookmarkIcon,
  markRead: CheckCircleIcon,
  unreadIndicator: EllipsisHorizontalCircleIcon,
  search: MagnifyingGlassIcon,
  category: FolderIcon,
  back: ChevronLeftIcon,
  error: ExclamationTriangleIcon,
  offline: WifiIcon,
  darkMode: MoonIcon,
  lightMode: SunIcon,
  user: UserIcon,
  logout: ArrowRightOnRectangleIcon,
  chevronDown: ChevronDownIcon,
  eye: EyeIcon,
  eyeOff: EyeSlashIcon,
  mail: EnvelopeIcon,
  lock: LockClosedIcon,
  alert: ExclamationCircleIcon,
  plus: PlusIcon,
  adjustments: AdjustmentsHorizontalIcon,
  filter: FunnelIcon,
};

// Export individual icons for direct use
export {
  ArrowPathIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  BookmarkIcon,
  CheckCircleIcon,
  EllipsisHorizontalCircleIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  WifiIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
};