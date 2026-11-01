/**
 * BAUST Club Management System - API Service Layer
 * Enforces role-based permissions, privacy rules, data validation, and room conflict resolution.
 */

import { db } from './db';
import {
  User,
  Club,
  Membership,
  Event,
  EventRegistration,
  Announcement,
  CollaborationRequest,
  Equipment,
  RoomBooking,
  UserRole
} from '../types';

// Helper to simulate realistic async network response
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export interface CurrentUserSession {
  user: User;
  token: string;
}

export class ApiError extends Error {
  public field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ApiError';
    this.field = field;
  }
}

class ApiService {
  // Session storage in memory
  private currentSession: CurrentUserSession | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem('baust_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Refresh user data from db
        const liveUser = db.findUserById(parsed.user?.id);
        if (liveUser) {
          this.currentSession = { user: liveUser, token: parsed.token };
        }
      }
    } catch {
      this.currentSession = null;
    }
  }

  public getSession(): CurrentUserSession | null {
    if (this.currentSession) {
      // Always sync with latest user record from DB
      const liveUser = db.findUserById(this.currentSession.user.id);
      if (liveUser) {
        this.currentSession.user = liveUser;
      }
    }
    return this.currentSession;
  }

  public setSession(session: CurrentUserSession | null): void {
    this.currentSession = session;
    if (session) {
      localStorage.setItem('baust_auth_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('baust_auth_session');
    }
  }

  // =========================================================================
  // MODULE 1: AUTHENTICATION, ACCOUNT & DASHBOARD
  // =========================================================================

  /**
   * 1. SIGNUP (Student)
   * Fields: Name, Student ID, Email, Department, Batch, Password, Confirm Password
   * Validates email format, unique Student ID, password >= 8 chars with >= 1 digit.
   */
  public async registerStudent(data: {
    name: string;
    studentId: string;
    email: string;
    department: string;
    batch: string;
    password: string;
    confirmPassword: string;
    phone?: string;
  }): Promise<{ success: boolean; user: User }> {
    await delay();

    const name = data.name.trim();
    const studentId = data.studentId.trim();
    const email = data.email.trim().toLowerCase();
    const department = data.department.trim();
    const batch = data.batch.trim();
    const password = data.password;

    if (!name) throw new ApiError('Full name is required', 'name');
    if (!studentId) throw new ApiError('Student ID is required', 'studentId');
    if (!email) throw new ApiError('Email address is required', 'email');
    if (!department) throw new ApiError('Department is required', 'department');
    if (!batch) throw new ApiError('Batch is required', 'batch');

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError('Please enter a valid email address (e.g. name@baust.edu.bd)', 'email');
    }

    // Password strength check (min 8 chars, at least one number)
    if (password.length < 8) {
      throw new ApiError('Password must be at least 8 characters long', 'password');
    }
    if (!/\d/.test(password)) {
      throw new ApiError('Password must contain at least one number', 'password');
    }
    if (password !== data.confirmPassword) {
      throw new ApiError('Passwords do not match', 'confirmPassword');
    }

    // Check unique Student ID
    const existingById = db.findUserByStudentId(studentId);
    if (existingById) {
      throw new ApiError('Student ID is already registered in the system', 'studentId');
    }

    // Check unique Email
    const existingByEmail = db.findUserByEmailOrStudentId(email);
    if (existingByEmail) {
      throw new ApiError('Email is already registered. Please login instead.', 'email');
    }

    const newUser: User = {
      id: 'u_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name,
      studentId,
      email,
      department,
      batch,
      passwordHash: password, // In production, bcrypt hash
      role: 'student',
      clubId: null,
      phone: data.phone?.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);
    return { success: true, user: newUser };
  }

  /**
   * 2. LOGIN - GENERAL STUDENTS
   * Fields: Student ID or Email, Password
   */
  public async loginStudent(identifier: string, password: string): Promise<CurrentUserSession> {
    await delay();
    if (!identifier.trim() || !password) {
      throw new ApiError('Invalid ID or password');
    }

    const user = db.findUserByEmailOrStudentId(identifier);
    if (!user || user.passwordHash !== password) {
      throw new ApiError('Invalid ID or password');
    }

    // Must be student role for general student login
    if (user.role !== 'student') {
      // If club admin or super admin logs in via general portal, allow with appropriate session or guide them
      // We will allow login but preserve their role so they are routed accordingly!
    }

    const session: CurrentUserSession = {
      user,
      token: 'jwt_sim_' + user.id + '_' + Date.now()
    };
    this.setSession(session);
    return session;
  }

  /**
   * 3. LOGIN - CLUB PRESIDENT
   * Fields: Email, Password; validate role=clubAdmin
   */
  public async loginClubPresident(email: string, password: string): Promise<CurrentUserSession> {
    await delay();
    if (!email.trim() || !password) {
      throw new ApiError('Please provide both email and password');
    }

    const user = db.findUserByEmailOrStudentId(email);
    if (!user || user.passwordHash !== password) {
      throw new ApiError('Invalid credentials');
    }

    if (user.role !== 'clubAdmin') {
      throw new ApiError('Access denied: You do not have Club President permissions');
    }

    if (!user.clubId) {
      throw new ApiError('No club assignment found for this president account');
    }

    const session: CurrentUserSession = {
      user,
      token: 'jwt_sim_admin_' + user.id + '_' + Date.now()
    };
    this.setSession(session);
    return session;
  }

  /**
   * 4. LOGIN - ASW (Super Admin)
   * Separate route (/admin/login), not linked from homepage
   * Fields: Email, Password; validate role=superAdmin
   */
  public async loginSuperAdmin(email: string, password: string): Promise<CurrentUserSession> {
    await delay();
    if (!email.trim() || !password) {
      throw new ApiError('Please provide administrative credentials');
    }

    const user = db.findUserByEmailOrStudentId(email);
    if (!user || user.passwordHash !== password) {
      throw new ApiError('Invalid administrative credentials');
    }

    if (user.role !== 'superAdmin') {
      throw new ApiError('Access denied: Directorate of Students Welfare (ASW) clearance required');
    }

    const session: CurrentUserSession = {
      user,
      token: 'jwt_sim_super_' + user.id + '_' + Date.now()
    };
    this.setSession(session);
    return session;
  }

  /**
   * 5. CHANGE PASSWORD (all logged-in roles)
   * Current Password, New Password, Confirm New Password
   */
  public async changePassword(
    userId: string,
    currentPass: string,
    newPass: string,
    confirmPass: string
  ): Promise<{ success: boolean }> {
    await delay();
    const user = db.findUserById(userId);
    if (!user) throw new ApiError('User not found');

    if (user.passwordHash !== currentPass) {
      throw new ApiError('Current password is incorrect', 'currentPass');
    }

    if (newPass.length < 8) {
      throw new ApiError('New password must be at least 8 characters long', 'newPass');
    }
    if (!/\d/.test(newPass)) {
      throw new ApiError('New password must contain at least one number', 'newPass');
    }
    if (newPass !== confirmPass) {
      throw new ApiError('New passwords do not match', 'confirmPass');
    }

    db.updateUser(userId, { passwordHash: newPass });
    return { success: true };
  }

  /**
   * 6. FORGOT / RESET PASSWORD
   * Generate time-limited reset code/token (show in simulation UI)
   */
  public async requestPasswordReset(email: string): Promise<{ token: string; expiresAt: string }> {
    await delay();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.findUserByEmailOrStudentId(cleanEmail);
    if (!user) {
      throw new ApiError('No account found with this email address', 'email');
    }

    // Generate random 6-character uppercase code
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    db.addResetToken({
      id: 'rst_' + Date.now(),
      email: user.email,
      token,
      expiresAt,
      used: false
    });

    return { token, expiresAt };
  }

  public async resetPasswordWithToken(
    tokenString: string,
    newPass: string,
    confirmPass: string
  ): Promise<{ success: boolean }> {
    await delay();
    const cleanToken = tokenString.trim().toUpperCase();
    const valid = db.findValidResetToken(cleanToken);
    if (!valid) {
      throw new ApiError('Invalid or expired reset code. Please request a new one.', 'token');
    }

    if (newPass.length < 8) {
      throw new ApiError('Password must be at least 8 characters long', 'newPass');
    }
    if (!/\d/.test(newPass)) {
      throw new ApiError('Password must contain at least one number', 'newPass');
    }
    if (newPass !== confirmPass) {
      throw new ApiError('Passwords do not match', 'confirmPass');
    }

    const user = db.findUserByEmailOrStudentId(valid.email);
    if (!user) throw new ApiError('User account not found');

    db.updateUser(user.id, { passwordHash: newPass });
    db.markResetTokenUsed(cleanToken);
    return { success: true };
  }

  public logout(): void {
    this.setSession(null);
  }

  // =========================================================================
  // MODULE 2: CLUB DISCOVERY & MEMBERSHIP MANAGEMENT
  // =========================================================================

  /**
   * 8. SEARCH & FILTER CLUBS (Student & Public)
   * Returns club list with calculated real approved member counts
   */
  public async getClubs(filter?: { search?: string; category?: string; status?: string }): Promise<
    (Club & { memberCount: number; pendingCount: number; adminName?: string })[]
  > {
    await delay(80);
    let clubs = db.getAllClubs();

    if (filter?.status) {
      clubs = clubs.filter((c) => c.status === filter.status);
    }
    if (filter?.category && filter.category !== 'all') {
      clubs = clubs.filter((c) => c.category.toLowerCase().includes(filter.category!.toLowerCase()));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      clubs = clubs.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    const allMemberships = db.getAllMemberships();
    const allUsers = db.getAllUsers();

    return clubs.map((club) => {
      const approvedMembers = allMemberships.filter(
        (m) => m.clubId === club.id && m.status === 'approved'
      );
      const pendingMembers = allMemberships.filter(
        (m) => m.clubId === club.id && m.status === 'pending'
      );
      const admin = allUsers.find((u) => u.clubId === club.id && u.role === 'clubAdmin');

      return {
        ...club,
        memberCount: approvedMembers.length,
        pendingCount: pendingMembers.length,
        adminName: admin ? admin.name : 'Unassigned'
      };
    });
  }

  public async getClubDetail(clubId: string): Promise<
    Club & {
      memberCount: number;
      adminName: string;
      upcomingEvents: Event[];
      announcements: Announcement[];
    }
  > {
    await delay(60);
    const club = db.getClubById(clubId);
    if (!club) throw new ApiError('Club not found');

    const approvedMembers = db.getAllMemberships().filter(
      (m) => m.clubId === clubId && m.status === 'approved'
    );
    const admin = db.getAllUsers().find((u) => u.clubId === clubId && u.role === 'clubAdmin');

    const now = new Date().toISOString().split('T')[0];
    const upcomingEvents = db.getEventsByClub(clubId).filter((e) => e.date >= now);
    const announcements = db.getAnnouncementsByClub(clubId);

    return {
      ...club,
      memberCount: approvedMembers.length,
      adminName: admin ? admin.name : 'President Unassigned',
      upcomingEvents,
      announcements
    };
  }

  /**
   * 9. MEMBERSHIP REGISTRATION (Student)
   * Apply form -> Membership status="pending". Prevent duplicate applications.
   */
  public async applyForMembership(
    studentId: string,
    clubId: string,
    motivation?: string
  ): Promise<Membership> {
    await delay();
    const student = db.findUserByStudentId(studentId);
    if (!student) throw new ApiError('Student record not found');

    const club = db.getClubById(clubId);
    if (!club || club.status !== 'active') {
      throw new ApiError('This club is currently not accepting new applications');
    }

    // Check existing applications
    const existing = db
      .getAllMemberships()
      .find((m) => m.studentId === studentId && m.clubId === clubId);

    if (existing) {
      if (existing.status === 'approved') {
        throw new ApiError('You are already an approved member of this club');
      }
      if (existing.status === 'pending') {
        throw new ApiError('You already have a pending application for this club');
      }
      if (existing.status === 'rejected') {
        // Allow re-applying by updating previous application
        const updated = db.updateMembership(existing.id, {
          status: 'pending',
          motivation: motivation || '',
          appliedAt: new Date().toISOString()
        });
        return updated!;
      }
      if (existing.status === 'left') {
        // Re-apply after leaving
        const updated = db.updateMembership(existing.id, {
          status: 'pending',
          motivation: motivation || '',
          appliedAt: new Date().toISOString()
        });
        return updated!;
      }
    }

    const newMembership: Membership = {
      id: 'm_' + Date.now() + Math.random().toString(36).substring(2, 5),
      studentId,
      clubId,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      motivation: motivation?.trim() || ''
    };

    db.addMembership(newMembership);
    return newMembership;
  }

  /**
   * 10. MEMBERSHIP APPROVE / REJECT (Club Admin)
   * Scoped to admin's own clubId only.
   */
  public async reviewMembership(
    adminUserId: string,
    membershipId: string,
    decision: 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<Membership> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized: Only the assigned Club President can review applications');
    }

    const membership = db.getAllMemberships().find((m) => m.id === membershipId);
    if (!membership) throw new ApiError('Application not found');

    // PRIVACY & ACCESS CONTROL: ensure membership belongs to admin's club
    if (membership.clubId !== admin.clubId) {
      throw new ApiError('Access Denied: You cannot review applications for another club');
    }

    const updated = db.updateMembership(membershipId, {
      status: decision,
      rejectionReason: decision === 'rejected' ? rejectionReason?.trim() : undefined
    });
    return updated!;
  }

  /**
   * 11. MEMBERSHIP CANCEL / LEAVE CLUB (Student)
   * "My Clubs" page -> "Leave Club" button with confirmation -> status="left"
   */
  public async leaveClub(studentId: string, clubId: string): Promise<Membership> {
    await delay();
    const membership = db
      .getAllMemberships()
      .find((m) => m.studentId === studentId && m.clubId === clubId && m.status === 'approved');

    if (!membership) {
      throw new ApiError('Active membership not found for this club');
    }

    const updated = db.updateMembership(membership.id, {
      status: 'left'
    });
    return updated!;
  }

  /**
   * 12 & 13. VIEW MEMBERS INFO & PRIVACY MAINTAIN (Club Admin / President)
   *
   * =========================================================================
   * PRIVACY MAINTAIN (Member Info) — Rule 13 Cross-Cutting Enforce:
   * Every backend query for member/application data filters strictly by
   * requesting admin's own clubId.
   * No endpoint ever returns another club's data.
   * Sensitive fields (phone, email) are only exposed to the verified clubAdmin
   * of that specific club, never publicly or cross-club.
   * =========================================================================
   */
  public async getClubMembers(
    requestingUserId: string,
    targetClubId: string,
    search?: string,
    batchFilter?: string
  ): Promise<
    {
      membershipId: string;
      studentId: string;
      name: string;
      department: string;
      batch: string;
      joinedDate: string;
      // Sensitive admin-only fields:
      email: string;
      phone?: string;
    }[]
  > {
    await delay(80);
    const requester = db.findUserById(requestingUserId);
    if (!requester) {
      throw new ApiError('Authentication required');
    }

    // ACCESS CONTROL CHECK:
    // Club Admin can ONLY query their OWN club.
    // SuperAdmin can query any club for administrative oversight.
    if (requester.role === 'clubAdmin' && requester.clubId !== targetClubId) {
      throw new ApiError('Privacy Violation: Club Presidents can only view members of their own club');
    }

    if (requester.role === 'student') {
      throw new ApiError('Privacy Violation: Member details are restricted to Club Administration');
    }

    const memberships = db
      .getAllMemberships()
      .filter((m) => m.clubId === targetClubId && m.status === 'approved');

    const allUsers = db.getAllUsers();

    let result = memberships.map((m) => {
      const studentUser = allUsers.find((u) => u.studentId === m.studentId);
      return {
        membershipId: m.id,
        studentId: m.studentId,
        name: studentUser ? studentUser.name : 'Unknown Student',
        department: studentUser ? studentUser.department : 'General',
        batch: studentUser ? studentUser.batch : 'N/A',
        joinedDate: m.updatedAt || m.appliedAt,
        // Sensitive fields provided strictly because requester is authorized admin:
        email: studentUser ? studentUser.email : 'N/A',
        phone: studentUser?.phone || 'Not provided'
      };
    });

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q)
      );
    }

    if (batchFilter && batchFilter !== 'all') {
      result = result.filter((r) => r.batch === batchFilter);
    }

    return result;
  }

  /**
   * Pending applications query strictly scoped to admin's own clubId
   */
  public async getPendingApplications(adminUserId: string): Promise<
    {
      membershipId: string;
      studentId: string;
      name: string;
      department: string;
      batch: string;
      appliedAt: string;
      motivation?: string;
      email: string;
    }[]
  > {
    await delay(80);
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized: Only assigned Club President can access pending applications');
    }

    // PRIVACY ENFORCEMENT: Filter strictly by admin.clubId
    const pending = db
      .getAllMemberships()
      .filter((m) => m.clubId === admin.clubId && m.status === 'pending');

    const allUsers = db.getAllUsers();

    return pending.map((m) => {
      const student = allUsers.find((u) => u.studentId === m.studentId);
      return {
        membershipId: m.id,
        studentId: m.studentId,
        name: student ? student.name : 'Unknown Student',
        department: student ? student.department : 'N/A',
        batch: student ? student.batch : 'N/A',
        appliedAt: m.appliedAt,
        motivation: m.motivation,
        email: student ? student.email : 'N/A'
      };
    });
  }

  /**
   * Student's own memberships
   */
  public async getStudentMemberships(studentId: string): Promise<
    (Membership & { clubName: string; clubCategory: string })[]
  > {
    await delay(60);
    const list = db.getMembershipsByStudent(studentId);
    const clubs = db.getAllClubs();

    return list.map((m) => {
      const club = clubs.find((c) => c.id === m.clubId);
      return {
        ...m,
        clubName: club ? club.name : 'Unknown Club',
        clubCategory: club ? club.category : 'General'
      };
    });
  }

  /**
   * 14. ADD NEW CLUB (Super Admin)
   * Form: Club Name, Category, Description, assign initial Club Admin
   * Updates assigned user's role to clubAdmin + set clubId
   */
  public async createClub(
    adminUserId: string,
    data: {
      name: string;
      category: string;
      description: string;
      adminUserId: string; // The user to assign as president
    }
  ): Promise<Club> {
    await delay();
    const superAdmin = db.findUserById(adminUserId);
    if (!superAdmin || superAdmin.role !== 'superAdmin') {
      throw new ApiError('Access Denied: Only Super Admin (ASW) can establish new university clubs');
    }

    const name = data.name.trim();
    const category = data.category.trim();
    const description = data.description.trim();

    if (!name) throw new ApiError('Club name is required', 'name');
    if (!category) throw new ApiError('Category is required', 'category');
    if (!description) throw new ApiError('Description is required', 'description');
    if (!data.adminUserId) throw new ApiError('Please assign an initial Club President', 'adminUserId');

    const targetUser = db.findUserById(data.adminUserId);
    if (!targetUser) throw new ApiError('Assigned user not found', 'adminUserId');

    const newClubId = 'c_' + Date.now();
    const newClub: Club = {
      id: newClubId,
      name,
      category,
      description,
      status: 'active',
      foundedYear: new Date().getFullYear().toString(),
      adminId: targetUser.id,
      bannerImage: '/src/assets/images/baust_hero_campus_1793266930202.jpg'
    };

    db.addClub(newClub);

    // Promote user to clubAdmin with this clubId
    db.updateUser(targetUser.id, {
      role: 'clubAdmin',
      clubId: newClubId
    });

    return newClub;
  }

  /**
   * 15. SUPER ADMIN PANEL
   * Activate / Deactivate club, Delete club
   */
  public async toggleClubStatus(superAdminId: string, clubId: string): Promise<Club> {
    await delay();
    const user = db.findUserById(superAdminId);
    if (!user || user.role !== 'superAdmin') throw new ApiError('Unauthorized');

    const club = db.getClubById(clubId);
    if (!club) throw new ApiError('Club not found');

    const newStatus = club.status === 'active' ? 'inactive' : 'active';
    const updated = db.updateClub(clubId, { status: newStatus });
    return updated!;
  }

  public async deleteClub(superAdminId: string, clubId: string): Promise<boolean> {
    await delay();
    const user = db.findUserById(superAdminId);
    if (!user || user.role !== 'superAdmin') throw new ApiError('Unauthorized');

    return db.deleteClub(clubId);
  }

  public async getSuperAdminDashboardStats(superAdminId: string) {
    await delay(70);
    const user = db.findUserById(superAdminId);
    if (!user || user.role !== 'superAdmin') throw new ApiError('Unauthorized');

    const users = db.getAllUsers();
    const clubs = db.getAllClubs();
    const collabs = db.getAllCollaborationRequests();
    const events = db.getAllEvents();

    const totalStudents = users.filter((u) => u.role === 'student').length;
    const totalClubs = clubs.length;
    const pendingCollabs = collabs.filter((c) => c.status === 'pending').length;
    const totalEvents = events.length;

    return {
      totalStudents,
      totalClubs,
      pendingCollabs,
      totalEvents
    };
  }

  // =========================================================================
  // MODULE 3: EVENTS, ANNOUNCEMENTS & COLLABORATION
  // =========================================================================

  /**
   * 16. EVENT ANNOUNCE (Club Admin / President)
   * Create, Edit, Cancel
   */
  public async createEvent(
    adminUserId: string,
    data: {
      title: string;
      description: string;
      date: string;
      time?: string;
      venue: string;
      registrationDeadline: string;
      visibility: 'public' | 'membersOnly';
    }
  ): Promise<Event> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized: Only active Club Presidents can announce events');
    }

    if (!data.title.trim()) throw new ApiError('Title is required', 'title');
    if (!data.description.trim()) throw new ApiError('Description is required', 'description');
    if (!data.date) throw new ApiError('Event date is required', 'date');
    if (!data.venue.trim()) throw new ApiError('Venue is required', 'venue');
    if (!data.registrationDeadline) throw new ApiError('Registration deadline is required', 'registrationDeadline');

    if (data.registrationDeadline > data.date) {
      throw new ApiError('Registration deadline cannot be after the event date', 'registrationDeadline');
    }

    const newEvent: Event = {
      id: 'ev_' + Date.now(),
      clubId: admin.clubId,
      title: data.title.trim(),
      description: data.description.trim(),
      date: data.date,
      time: data.time || '10:00 AM',
      venue: data.venue.trim(),
      registrationDeadline: data.registrationDeadline,
      visibility: data.visibility,
      createdAt: new Date().toISOString()
    };

    db.addEvent(newEvent);
    return newEvent;
  }

  public async updateEvent(
    adminUserId: string,
    eventId: string,
    updates: Partial<Event>
  ): Promise<Event> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    const event = db.getEventById(eventId);
    if (!event) throw new ApiError('Event not found');

    if (event.clubId !== admin.clubId) {
      throw new ApiError('Access Denied: You cannot modify events of another club');
    }

    const updated = db.updateEvent(eventId, updates);
    return updated!;
  }

  public async deleteEvent(adminUserId: string, eventId: string): Promise<boolean> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    const event = db.getEventById(eventId);
    if (!event) throw new ApiError('Event not found');

    if (event.clubId !== admin.clubId) {
      throw new ApiError('Access Denied');
    }

    return db.deleteEvent(eventId);
  }

  /**
   * 17 & 19. REGISTRATION OF EVENT & VISIBILITY PRIVACY
   * Queries respect visibility rules:
   * - Public events visible to everyone
   * - membersOnly events ONLY visible to students who are approved members of the club!
   */
  public async getEventsForViewer(viewerUserId?: string): Promise<
    (Event & {
      clubName: string;
      isRegistered: boolean;
      isMemberOfHostingClub: boolean;
      registrationCount: number;
    })[]
  > {
    await delay(70);
    const viewer = viewerUserId ? db.findUserById(viewerUserId) : null;
    const allEvents = db.getAllEvents();
    const allClubs = db.getAllClubs();
    const allRegistrations = db.getAllEventRegistrations();
    const allMemberships = db.getAllMemberships();

    let approvedClubIds: string[] = [];
    if (viewer && viewer.role === 'student') {
      approvedClubIds = allMemberships
        .filter((m) => m.studentId === viewer.studentId && m.status === 'approved')
        .map((m) => m.clubId);
    } else if (viewer && viewer.role === 'clubAdmin' && viewer.clubId) {
      approvedClubIds = [viewer.clubId];
    } else if (viewer && viewer.role === 'superAdmin') {
      // SuperAdmin can view all
      approvedClubIds = allClubs.map((c) => c.id);
    }

    // Filter events based on visibility
    const visibleEvents = allEvents.filter((event) => {
      if (event.visibility === 'public') return true;
      // membersOnly: viewer must belong to hosting club or co-host club
      if (viewer?.role === 'superAdmin') return true;
      return (
        approvedClubIds.includes(event.clubId) ||
        (event.coHostClubId && approvedClubIds.includes(event.coHostClubId))
      );
    });

    return visibleEvents.map((event) => {
      const club = allClubs.find((c) => c.id === event.clubId);
      const regCount = allRegistrations.filter((r) => r.eventId === event.id).length;
      const isRegistered = viewer?.studentId
        ? allRegistrations.some((r) => r.eventId === event.id && r.studentId === viewer.studentId)
        : false;
      const isMemberOfHostingClub = approvedClubIds.includes(event.clubId);

      return {
        ...event,
        clubName: club ? club.name : 'BAUST Club',
        isRegistered,
        isMemberOfHostingClub,
        registrationCount: regCount
      };
    });
  }

  public async registerForEvent(studentUserId: string, eventId: string): Promise<EventRegistration> {
    await delay();
    const student = db.findUserById(studentUserId);
    if (!student || student.role !== 'student') {
      throw new ApiError('Only registered students can participate in club events');
    }

    const event = db.getEventById(eventId);
    if (!event) throw new ApiError('Event not found');

    // Check registration deadline
    const today = new Date().toISOString().split('T')[0];
    if (event.registrationDeadline < today) {
      throw new ApiError('Registration deadline for this event has passed');
    }

    // Check visibility restriction
    if (event.visibility === 'membersOnly') {
      const isMember = db
        .getAllMemberships()
        .some((m) => m.studentId === student.studentId && m.clubId === event.clubId && m.status === 'approved');
      if (!isMember) {
        throw new ApiError('Access restricted: This event is exclusively for approved club members');
      }
    }

    // Prevent duplicate registration
    const existing = db
      .getAllEventRegistrations()
      .find((r) => r.studentId === student.studentId && r.eventId === eventId);
    if (existing) {
      throw new ApiError('You are already registered for this event');
    }

    const newReg: EventRegistration = {
      id: 'er_' + Date.now(),
      studentId: student.studentId,
      eventId,
      registeredAt: new Date().toISOString()
    };

    db.addEventRegistration(newReg);
    return newReg;
  }

  public async getStudentRegisteredEvents(studentId: string): Promise<
    (EventRegistration & { event: Event; clubName: string })[]
  > {
    await delay(60);
    const regs = db.getRegistrationsByStudent(studentId);
    const clubs = db.getAllClubs();

    return regs
      .map((r) => {
        const ev = db.getEventById(r.eventId);
        if (!ev) return null;
        const club = clubs.find((c) => c.id === ev.clubId);
        return {
          ...r,
          event: ev,
          clubName: club ? club.name : 'Unknown Club'
        };
      })
      .filter(Boolean) as (EventRegistration & { event: Event; clubName: string })[];
  }

  /**
   * 18 & 19. ANNOUNCEMENT EDIT OR DELETE & VISIBILITY
   */
  public async getAnnouncementsForViewer(viewerUserId?: string): Promise<
    (Announcement & { clubName: string; isOwnClub: boolean })[]
  > {
    await delay(70);
    const viewer = viewerUserId ? db.findUserById(viewerUserId) : null;
    const all = db.getAllAnnouncements();
    const clubs = db.getAllClubs();

    let approvedClubIds: string[] = [];
    if (viewer && viewer.role === 'student') {
      approvedClubIds = db
        .getAllMemberships()
        .filter((m) => m.studentId === viewer.studentId && m.status === 'approved')
        .map((m) => m.clubId);
    } else if (viewer && viewer.role === 'clubAdmin' && viewer.clubId) {
      approvedClubIds = [viewer.clubId];
    } else if (viewer && viewer.role === 'superAdmin') {
      approvedClubIds = clubs.map((c) => c.id);
    }

    // Filter announcements by visibility
    const visible = all.filter((a) => {
      if (a.visibility === 'public') return true;
      if (viewer?.role === 'superAdmin') return true;
      return approvedClubIds.includes(a.clubId);
    });

    // Sort newest first
    visible.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return visible.map((a) => {
      const club = clubs.find((c) => c.id === a.clubId);
      const isOwnClub = viewer?.clubId === a.clubId;
      return {
        ...a,
        clubName: club ? club.name : 'BAUST Club',
        isOwnClub
      };
    });
  }

  public async createAnnouncement(
    adminUserId: string,
    data: {
      title: string;
      content: string;
      visibility: 'public' | 'membersOnly';
    }
  ): Promise<Announcement> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized: Only Club Presidents can publish announcements');
    }

    if (!data.title.trim()) throw new ApiError('Title is required', 'title');
    if (!data.content.trim()) throw new ApiError('Content is required', 'content');

    const newAnnouncement: Announcement = {
      id: 'an_' + Date.now(),
      clubId: admin.clubId,
      title: data.title.trim(),
      content: data.content.trim(),
      visibility: data.visibility,
      createdAt: new Date().toISOString(),
      editedAt: null
    };

    db.addAnnouncement(newAnnouncement);
    return newAnnouncement;
  }

  public async updateAnnouncement(
    adminUserId: string,
    announcementId: string,
    data: {
      title: string;
      content: string;
      visibility: 'public' | 'membersOnly';
    }
  ): Promise<Announcement> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    const ann = db.getAnnouncementById(announcementId);
    if (!ann) throw new ApiError('Announcement not found');

    if (ann.clubId !== admin.clubId) {
      throw new ApiError('Access Denied: Only the posting club president can edit this notice');
    }

    const updated = db.updateAnnouncement(announcementId, {
      title: data.title.trim(),
      content: data.content.trim(),
      visibility: data.visibility
    });
    return updated!;
  }

  public async deleteAnnouncement(adminUserId: string, announcementId: string): Promise<boolean> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    const ann = db.getAnnouncementById(announcementId);
    if (!ann) throw new ApiError('Announcement not found');

    if (ann.clubId !== admin.clubId) {
      throw new ApiError('Access Denied');
    }

    return db.deleteAnnouncement(announcementId);
  }

  // =========================================================================
  // 20 & 21. CLUB INTERACTION & COLLABORATION
  // =========================================================================

  public async getCollaborationRequests(adminUserId: string): Promise<{
    outgoing: (CollaborationRequest & { targetClubName: string })[];
    incoming: (CollaborationRequest & { requestingClubName: string })[];
  }> {
    await delay(70);
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    const all = db.getAllCollaborationRequests();
    const clubs = db.getAllClubs();

    const outgoing = all
      .filter((r) => r.requestingClubId === admin.clubId)
      .map((r) => {
        const target = clubs.find((c) => c.id === r.targetClubId);
        return { ...r, targetClubName: target ? target.name : 'Unknown Club' };
      });

    const incoming = all
      .filter((r) => r.targetClubId === admin.clubId)
      .map((r) => {
        const reqClub = clubs.find((c) => c.id === r.requestingClubId);
        return { ...r, requestingClubName: reqClub ? reqClub.name : 'Unknown Club' };
      });

    return { outgoing, incoming };
  }

  public async sendCollaborationRequest(
    adminUserId: string,
    targetClubId: string,
    eventDetails: string
  ): Promise<CollaborationRequest> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    if (admin.clubId === targetClubId) {
      throw new ApiError('Cannot collaborate with your own club');
    }

    if (!eventDetails.trim()) {
      throw new ApiError('Please outline proposed event details and agenda', 'eventDetails');
    }

    const newReq: CollaborationRequest = {
      id: 'collab_' + Date.now(),
      requestingClubId: admin.clubId,
      targetClubId,
      eventDetails: eventDetails.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.addCollaborationRequest(newReq);
    return newReq;
  }

  public async respondToCollaborationRequest(
    adminUserId: string,
    requestId: string,
    decision: 'accepted' | 'rejected',
    createSharedEvent?: {
      title: string;
      date: string;
      venue: string;
    }
  ): Promise<CollaborationRequest> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    const req = db.getAllCollaborationRequests().find((r) => r.id === requestId);
    if (!req) throw new ApiError('Collaboration request not found');

    if (req.targetClubId !== admin.clubId) {
      throw new ApiError('Access Denied: Only the target club president can respond');
    }

    let sharedEventId: string | undefined = undefined;

    if (decision === 'accepted' && createSharedEvent) {
      const jointEvent: Event = {
        id: 'ev_joint_' + Date.now(),
        clubId: req.requestingClubId,
        coHostClubId: req.targetClubId,
        title: createSharedEvent.title || 'Joint Collaboration Event',
        description: `Collaborative initiative co-hosted by both clubs. Proposal: ${req.eventDetails}`,
        date: createSharedEvent.date || new Date().toISOString().split('T')[0],
        venue: createSharedEvent.venue || 'BAUST Main Campus',
        registrationDeadline: createSharedEvent.date || new Date().toISOString().split('T')[0],
        visibility: 'public',
        createdAt: new Date().toISOString()
      };
      db.addEvent(jointEvent);
      sharedEventId = jointEvent.id;
    }

    const updated = db.updateCollaborationRequest(requestId, {
      status: decision,
      sharedEventId
    });

    return updated!;
  }

  // =========================================================================
  // 22. EQUIPMENT RE-USE (Borrowing between clubs)
  // =========================================================================

  public async getEquipmentList(adminUserId: string): Promise<{
    myEquipment: Equipment[];
    availableOthers: (Equipment & { ownerClubName: string })[];
    borrowedByMe: (Equipment & { ownerClubName: string })[];
  }> {
    await delay(70);
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    const all = db.getAllEquipment();
    const clubs = db.getAllClubs();

    const myEquipment = all.filter((e) => e.ownerClubId === admin.clubId);

    const availableOthers = all
      .filter((e) => e.ownerClubId !== admin.clubId && e.status === 'available')
      .map((e) => {
        const owner = clubs.find((c) => c.id === e.ownerClubId);
        return { ...e, ownerClubName: owner ? owner.name : 'Unknown Club' };
      });

    const borrowedByMe = all
      .filter((e) => e.borrowedByClubId === admin.clubId)
      .map((e) => {
        const owner = clubs.find((c) => c.id === e.ownerClubId);
        return { ...e, ownerClubName: owner ? owner.name : 'Unknown Club' };
      });

    return { myEquipment, availableOthers, borrowedByMe };
  }

  public async addClubEquipment(
    adminUserId: string,
    data: { name: string; category?: string }
  ): Promise<Equipment> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    if (!data.name.trim()) throw new ApiError('Equipment name is required', 'name');

    const newEq: Equipment = {
      id: 'eq_' + Date.now(),
      ownerClubId: admin.clubId,
      name: data.name.trim(),
      category: data.category?.trim() || 'General Inventory',
      status: 'available',
      borrowedByClubId: null
    };

    db.addEquipment(newEq);
    return newEq;
  }

  public async borrowEquipment(adminUserId: string, equipmentId: string): Promise<Equipment> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    const eq = db.getAllEquipment().find((e) => e.id === equipmentId);
    if (!eq) throw new ApiError('Equipment not found');

    if (eq.ownerClubId === admin.clubId) {
      throw new ApiError('This equipment is already owned by your club');
    }

    if (eq.status !== 'available') {
      throw new ApiError('Equipment is currently in use or borrowed by another club');
    }

    const updated = db.updateEquipment(equipmentId, {
      status: 'inUse',
      borrowedByClubId: admin.clubId,
      borrowedAt: new Date().toISOString()
    });

    return updated!;
  }

  public async returnEquipment(adminUserId: string, equipmentId: string): Promise<Equipment> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized');
    }

    const eq = db.getAllEquipment().find((e) => e.id === equipmentId);
    if (!eq) throw new ApiError('Equipment not found');

    // Either the borrowing club or the owner club can mark it returned
    if (eq.borrowedByClubId !== admin.clubId && eq.ownerClubId !== admin.clubId) {
      throw new ApiError('Unauthorized to return this item');
    }

    const updated = db.updateEquipment(equipmentId, {
      status: 'available',
      borrowedByClubId: null,
      borrowedAt: null
    });

    return updated!;
  }

  // =========================================================================
  // 23. ROOM ALLOCATION (Booking shared rooms & Conflict checking)
  // =========================================================================

  public readonly ROOM_OPTIONS = [
    'Central Auditorium',
    'Seminar Hall 301 (Academic Bldg 1)',
    'Conference Room A (Academic Bldg 1)',
    'Conference Room B (Academic Bldg 2)',
    'Gymnasium Indoor Stage',
    'Open Air Amphitheatre',
    'Central Computer Lab (Lab 4)'
  ];

  public readonly TIME_SLOTS = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  public async getRoomBookings(dateFilter?: string): Promise<
    (RoomBooking & { clubName: string; isMyClub: boolean })[]
  > {
    await delay(60);
    const bookings = db.getAllRoomBookings();
    const clubs = db.getAllClubs();
    const session = this.getSession();

    let filtered = bookings;
    if (dateFilter) {
      filtered = bookings.filter((b) => b.date === dateFilter);
    }

    return filtered.map((b) => {
      const club = clubs.find((c) => c.id === b.clubId);
      return {
        ...b,
        clubName: club ? club.name : 'Unknown Club',
        isMyClub: session?.user.clubId === b.clubId
      };
    });
  }

  /**
   * Book a room with STRICT conflict checking
   * If slot is taken, offers alternative time slots on that date!
   */
  public async bookRoom(
    adminUserId: string,
    data: {
      roomName: string;
      date: string;
      timeSlot: string;
      purpose?: string;
    }
  ): Promise<RoomBooking> {
    await delay();
    const admin = db.findUserById(adminUserId);
    if (!admin || admin.role !== 'clubAdmin' || !admin.clubId) {
      throw new ApiError('Unauthorized: Only Club Presidents can reserve university facilities');
    }

    const { roomName, date, timeSlot, purpose } = data;

    if (!roomName) throw new ApiError('Please select a facility/room', 'roomName');
    if (!date) throw new ApiError('Booking date is required', 'date');
    if (!timeSlot) throw new ApiError('Time slot is required', 'timeSlot');

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      throw new ApiError('Cannot book room for past dates', 'date');
    }

    // CHECK FOR CONFLICTS
    const allBookings = db.getAllRoomBookings();
    const conflict = allBookings.find(
      (b) => b.roomName === roomName && b.date === date && b.timeSlot === timeSlot
    );

    if (conflict) {
      const clubs = db.getAllClubs();
      const conflictClub = clubs.find((c) => c.id === conflict.clubId);
      const conflictClubName = conflictClub ? conflictClub.name : 'Another club';

      // Find available alternative slots for this room on the same date
      const bookedSlotsOnDate = allBookings
        .filter((b) => b.roomName === roomName && b.date === date)
        .map((b) => b.timeSlot);

      const availableSlots = this.TIME_SLOTS.filter((slot) => !bookedSlotsOnDate.includes(slot));

      const suggestion =
        availableSlots.length > 0
          ? ` Alternative available slots on ${date}: ${availableSlots.slice(0, 3).join(', ')}.`
          : ` No remaining slots available in ${roomName} on ${date}. Please select another date or room.`;

      throw new ApiError(
        `Conflict detected: "${roomName}" is already reserved by ${conflictClubName} for the slot "${timeSlot}".${suggestion}`,
        'timeSlot'
      );
    }

    const newBooking: RoomBooking = {
      id: 'rb_' + Date.now(),
      clubId: admin.clubId,
      roomName,
      date,
      timeSlot,
      bookedAt: new Date().toISOString(),
      purpose: purpose?.trim() || 'Official Club Activity'
    };

    db.addRoomBooking(newBooking);
    return newBooking;
  }
}

export const api = new ApiService();
