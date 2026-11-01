/**
 * BAUST Club Management System - Core Data Types & Interfaces
 * Bangladesh Army University of Science and Technology (BAUST)
 */

export type UserRole = 'student' | 'clubAdmin' | 'superAdmin';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  batch: string;
  passwordHash: string;
  role: UserRole;
  clubId?: string | null; // Set if user is a clubAdmin
  phone?: string;         // Admin-only contact info
  createdAt?: string;
}

export type ClubStatus = 'active' | 'inactive';

export interface Club {
  id: string;
  name: string;
  category: string;
  description: string;
  status: ClubStatus;
  bannerImage?: string;
  logoIcon?: string;
  foundedYear?: string;
  adminId?: string; // ID of the assigned Club Admin
}

export type MembershipStatus = 'pending' | 'approved' | 'rejected' | 'left';

export interface Membership {
  id: string;
  studentId: string; // references User.studentId or User.id
  clubId: string;
  status: MembershipStatus;
  appliedAt: string;
  motivation?: string;
  rejectionReason?: string;
  updatedAt?: string;
}

export type EventVisibility = 'public' | 'membersOnly';

export interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: string;       // YYYY-MM-DD
  time?: string;      // HH:mm
  venue: string;
  registrationDeadline: string; // YYYY-MM-DD
  visibility: EventVisibility;
  coHostClubId?: string | null; // For accepted collaboration events
  createdAt?: string;
}

export interface EventRegistration {
  id: string;
  studentId: string;
  eventId: string;
  registeredAt: string;
}

export interface Announcement {
  id: string;
  clubId: string;
  title: string;
  content: string;
  visibility: EventVisibility;
  createdAt: string;
  editedAt: string | null;
}

export type CollaborationStatus = 'pending' | 'accepted' | 'rejected';

export interface CollaborationRequest {
  id: string;
  requestingClubId: string;
  targetClubId: string;
  eventDetails: string;
  status: CollaborationStatus;
  createdAt: string;
  rejectionReason?: string;
  sharedEventId?: string;
}

export type EquipmentStatus = 'available' | 'inUse';

export interface Equipment {
  id: string;
  ownerClubId: string;
  name: string;
  status: EquipmentStatus;
  borrowedByClubId: string | null;
  category?: string;
  borrowedAt?: string | null;
}

export interface RoomBooking {
  id: string;
  clubId: string;
  roomName: string;
  date: string;     // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 - 11:00 AM", "02:00 - 04:00 PM"
  bookedAt: string;
  purpose?: string;
}

export interface PasswordResetToken {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
}
