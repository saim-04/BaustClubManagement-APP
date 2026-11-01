/**
 * BAUST Club Management System - Persistent In-Memory & LocalStorage Data Store
 * Contains seed data for BAUST clubs, students, club presidents, and ASW administration.
 */

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
  PasswordResetToken
} from '../types';

const STORAGE_KEY = 'baust_club_cms_data_v1';

export interface DatabaseSchema {
  users: User[];
  clubs: Club[];
  memberships: Membership[];
  events: Event[];
  eventRegistrations: EventRegistration[];
  announcements: Announcement[];
  collaborationRequests: CollaborationRequest[];
  equipment: Equipment[];
  roomBookings: RoomBooking[];
  resetTokens: PasswordResetToken[];
}

const INITIAL_CLUBS: Club[] = [
  {
    id: 'c1',
    name: 'BAUST Computer Club (BCC)',
    category: 'Technology & Computing',
    description: 'The premier computing and software engineering club at BAUST. Organizing national hackathons, competitive programming contests, workshops on AI/ML, web development, and cyber security.',
    status: 'active',
    bannerImage: '/src/assets/images/baust_hero_campus_1793266930202.jpg',
    foundedYear: '2015',
    adminId: 'u_pres_bcc'
  },
  {
    id: 'c2',
    name: 'BAUST Robotics & Mechatronics Club (BRMC)',
    category: 'Engineering & Robotics',
    description: 'Dedicated to autonomous robotics, IoT innovations, drone prototyping, and line-follower competitions. Empowering students with hands-on microcontroller and mechanical fabrication training.',
    status: 'active',
    bannerImage: '/src/assets/images/baust_hero_campus_1793266930202.jpg',
    foundedYear: '2016',
    adminId: 'u_pres_brmc'
  },
  {
    id: 'c3',
    name: 'BAUST Cultural & Debating Society (BCDS)',
    category: 'Culture & Arts',
    description: 'Fostering public speaking, parliamentary debate, drama, musical arts, and traditional celebrations across all academic departments.',
    status: 'active',
    bannerImage: '/src/assets/images/baust_hero_campus_1793266930202.jpg',
    foundedYear: '2015',
    adminId: 'u_pres_bcds'
  },
  {
    id: 'c4',
    name: 'BAUST Sports Club (BSC)',
    category: 'Sports & Athletics',
    description: 'Organizing inter-departmental cricket, football, badminton, and table tennis tournaments. Promoting physical fitness and sportsmanship.',
    status: 'active',
    bannerImage: '/src/assets/images/baust_hero_campus_1793266930202.jpg',
    foundedYear: '2017',
    adminId: 'u_pres_bsc'
  },
  {
    id: 'c5',
    name: 'BAUST Career & Research Society (BCRS)',
    category: 'Career & Academics',
    description: 'Connecting undergraduate researchers with graduate scholarships, career fairs, resume workshops, and industry mentorship sessions.',
    status: 'active',
    bannerImage: '/src/assets/images/baust_hero_campus_1793266930202.jpg',
    foundedYear: '2018',
    adminId: 'u_pres_bcrs'
  }
];

const INITIAL_USERS: User[] = [
  // Super Admin (ASW)
  {
    id: 'u_super',
    name: 'Brig. Gen. (Retd.) M. Rahman',
    email: 'asw@baust.edu.bd',
    studentId: 'ASW-ADMIN-01',
    department: 'Directorate of Students Welfare',
    batch: 'Executive',
    passwordHash: 'Admin@123',
    role: 'superAdmin',
    clubId: null,
    phone: '+880 1711-000001'
  },
  // Club President - BCC (c1)
  {
    id: 'u_pres_bcc',
    name: 'Tahmid Hasan',
    email: 'bcc.president@baust.edu.bd',
    studentId: '200101012',
    department: 'Computer Science & Engineering',
    batch: '19th',
    passwordHash: 'President@123',
    role: 'clubAdmin',
    clubId: 'c1',
    phone: '+880 1712-345678'
  },
  // Club President - BRMC (c2)
  {
    id: 'u_pres_brmc',
    name: 'Nabila Anjum',
    email: 'robotics.president@baust.edu.bd',
    studentId: '200201025',
    department: 'Electrical & Electronic Engineering',
    batch: '19th',
    passwordHash: 'President@123',
    role: 'clubAdmin',
    clubId: 'c2',
    phone: '+880 1812-987654'
  },
  // Club President - BCDS (c3)
  {
    id: 'u_pres_bcds',
    name: 'Sifat Tanvir',
    email: 'debate.president@baust.edu.bd',
    studentId: '200301008',
    department: 'English',
    batch: '19th',
    passwordHash: 'President@123',
    role: 'clubAdmin',
    clubId: 'c3',
    phone: '+880 1713-112233'
  },
  // Students
  {
    id: 'u_student1',
    name: 'Fahim Shahriar',
    email: 'fahim.cse@baust.edu.bd',
    studentId: '210101045',
    department: 'Computer Science & Engineering',
    batch: '21st',
    passwordHash: 'Student@123',
    role: 'student',
    phone: '+880 1912-445566'
  },
  {
    id: 'u_student2',
    name: 'Sadia Jahan',
    email: 'sadia.bba@baust.edu.bd',
    studentId: '220301015',
    department: 'Business Administration',
    batch: '22nd',
    passwordHash: 'Student@123',
    role: 'student',
    phone: '+880 1612-778899'
  },
  {
    id: 'u_student3',
    name: 'Rayhan Kabir',
    email: 'rayhan.me@baust.edu.bd',
    studentId: '210401033',
    department: 'Mechanical Engineering',
    batch: '21st',
    passwordHash: 'Student@123',
    role: 'student',
    phone: '+880 1512-334455'
  },
  {
    id: 'u_student4',
    name: 'Afsana Mimi',
    email: 'afsana.ipe@baust.edu.bd',
    studentId: '230501004',
    department: 'Industrial & Production Engineering',
    batch: '23rd',
    passwordHash: 'Student@123',
    role: 'student',
    phone: '+880 1715-667788'
  }
];

const INITIAL_MEMBERSHIPS: Membership[] = [
  // Fahim is approved in BCC (c1)
  {
    id: 'm1',
    studentId: '210101045',
    clubId: 'c1',
    status: 'approved',
    appliedAt: '2026-09-10T10:30:00.000Z',
    motivation: 'Enthusiastic about web development and algorithmic problem solving.'
  },
  // Sadia is approved in BCDS (c3)
  {
    id: 'm2',
    studentId: '220301015',
    clubId: 'c3',
    status: 'approved',
    appliedAt: '2026-09-15T14:20:00.000Z',
    motivation: 'Passionate about parliamentary debating and youth leadership.'
  },
  // Rayhan is approved in BRMC (c2)
  {
    id: 'm3',
    studentId: '210401033',
    clubId: 'c2',
    status: 'approved',
    appliedAt: '2026-09-18T16:00:00.000Z',
    motivation: 'Interested in CAD design and pneumatic robotics.'
  },
  // Fahim applied to BRMC (c2) - pending application
  {
    id: 'm4',
    studentId: '210101045',
    clubId: 'c2',
    status: 'pending',
    appliedAt: '2026-10-20T11:15:00.000Z',
    motivation: 'Want to integrate computer vision with robotics for our final year project.'
  },
  // Afsana applied to BCC (c1) - pending application
  {
    id: 'm5',
    studentId: '230501004',
    clubId: 'c1',
    status: 'pending',
    appliedAt: '2026-10-24T09:45:00.000Z',
    motivation: 'Excited to learn Python and data science tools for industrial simulations.'
  }
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 'ev1',
    clubId: 'c1',
    title: 'BAUST National Inter-University Hackathon 2026',
    description: '36-hour intense collaborative coding challenge addressing AI for sustainability, smart healthcare, and fintech solutions. Open to all registered students across Bangladesh.',
    date: '2026-11-20',
    time: '09:00 AM',
    venue: 'Academic Building 1, Central Computer Lab',
    registrationDeadline: '2026-11-12',
    visibility: 'public',
    createdAt: '2026-10-01T12:00:00.000Z'
  },
  {
    id: 'ev2',
    clubId: 'c1',
    title: 'Competitive Programming Bootcamp: Dynamic Programming Masterclass',
    description: 'Exclusive hands-on problem-solving session for approved BCC members. Focusing on DP state optimization, segment trees, and graph algorithms.',
    date: '2026-11-08',
    time: '03:30 PM',
    venue: 'CSE Seminar Room 302',
    registrationDeadline: '2026-11-06',
    visibility: 'membersOnly',
    createdAt: '2026-10-15T08:00:00.000Z'
  },
  {
    id: 'ev3',
    clubId: 'c2',
    title: 'RoboQuest 2026: Line Following & Obstacle Avoider Challenge',
    description: 'Showcase your autonomous robotic vehicles on high-precision curved tracks. Microcontroller kits provided to top performers.',
    date: '2026-11-25',
    time: '10:00 AM',
    venue: 'BAUST Gymnasium Indoor Arena',
    registrationDeadline: '2026-11-18',
    visibility: 'public',
    createdAt: '2026-10-10T11:00:00.000Z'
  },
  {
    id: 'ev4',
    clubId: 'c3',
    title: 'BAUST Annual Inter-Department Debate Championship',
    description: 'Bengali and English parliamentary format debates tackling contemporary socio-economic and technological issues.',
    date: '2026-12-05',
    time: '02:00 PM',
    venue: 'BAUST Central Auditorium',
    registrationDeadline: '2026-11-28',
    visibility: 'public',
    createdAt: '2026-10-12T09:30:00.000Z'
  }
];

const INITIAL_EVENT_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'er1',
    studentId: '210101045',
    eventId: 'ev1',
    registeredAt: '2026-10-15T14:10:00.000Z'
  },
  {
    id: 'er2',
    studentId: '210101045',
    eventId: 'ev2',
    registeredAt: '2026-10-18T10:00:00.000Z'
  },
  {
    id: 'er3',
    studentId: '210401033',
    eventId: 'ev3',
    registeredAt: '2026-10-22T16:20:00.000Z'
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'an1',
    clubId: 'c1',
    title: 'Call for Hackathon 2026 Student Volunteers & Track Leads',
    content: 'BAUST Computer Club is recruiting active volunteers for hospitality, stage coordination, and technical evaluation for the upcoming National Hackathon. Certificates and official crests will be awarded.',
    visibility: 'public',
    createdAt: '2026-10-20T10:00:00.000Z',
    editedAt: null
  },
  {
    id: 'an2',
    clubId: 'c1',
    title: 'Internal Mock Contest & Server Maintenance Schedule',
    content: 'Notice for BCC Members: Our club grading judge server will be under maintenance this Friday from 10 PM to 2 AM. Please submit your practice solutions beforehand.',
    visibility: 'membersOnly',
    createdAt: '2026-10-22T15:00:00.000Z',
    editedAt: '2026-10-23T09:12:00.000Z'
  },
  {
    id: 'an3',
    clubId: 'c2',
    title: 'Arduino & Raspberry Pi Hardware Kits Available for Member Borrowing',
    content: 'BRMC lab members can now check out sensor modules and STM32 boards from the club inventory in Lab 204 during regular club office hours (Sunday to Thursday 4 PM - 6 PM).',
    visibility: 'membersOnly',
    createdAt: '2026-10-24T12:00:00.000Z',
    editedAt: null
  },
  {
    id: 'an4',
    clubId: 'c3',
    title: 'Auditions for Spring Cultural Festival Musical Ensemble',
    content: 'BCDS invites singers, instrumentalists, and recital artists to audition for the grand seasonal festival. Open to students from all departments.',
    visibility: 'public',
    createdAt: '2026-10-26T11:00:00.000Z',
    editedAt: null
  }
];

const INITIAL_COLLABORATIONS: CollaborationRequest[] = [
  {
    id: 'collab1',
    requestingClubId: 'c1',
    targetClubId: 'c2',
    eventDetails: 'Joint Workshop: "Embedded AI & Edge Computing with Raspberry Pi and OpenCV". We propose a 2-day session where BCC leads AI vision software and BRMC provides sensor kits.',
    status: 'pending',
    createdAt: '2026-10-25T14:30:00.000Z'
  },
  {
    id: 'collab2',
    requestingClubId: 'c3',
    targetClubId: 'c1',
    eventDetails: 'Website Portal for BAUST National Debate Fest 2026. BCDS requests technical collaboration from BCC to build the live registration and scoring portal.',
    status: 'accepted',
    createdAt: '2026-10-18T09:00:00.000Z'
  }
];

const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq1',
    ownerClubId: 'c1',
    name: 'Epson High-Lumen Wireless Projector (EB-2250U)',
    status: 'available',
    borrowedByClubId: null,
    category: 'AV & Display'
  },
  {
    id: 'eq2',
    ownerClubId: 'c1',
    name: 'Gigabit 24-Port Managed Network Switch with Cat6 Spools',
    status: 'available',
    borrowedByClubId: null,
    category: 'Networking'
  },
  {
    id: 'eq3',
    ownerClubId: 'c2',
    name: '3D Printer Creality Ender-3 V2 with PLA Filament Stash',
    status: 'inUse',
    borrowedByClubId: 'c1',
    category: 'Fabrication',
    borrowedAt: '2026-10-26T10:00:00.000Z'
  },
  {
    id: 'eq4',
    ownerClubId: 'c2',
    name: 'Digital Storage Oscilloscope (Rigol 100MHz 4-Ch)',
    status: 'available',
    borrowedByClubId: null,
    category: 'Testing'
  },
  {
    id: 'eq5',
    ownerClubId: 'c3',
    name: 'Behringer 12-Channel Audio Mixer & Shure Wireless Mic Set',
    status: 'available',
    borrowedByClubId: null,
    category: 'Sound'
  }
];

const INITIAL_ROOM_BOOKINGS: RoomBooking[] = [
  {
    id: 'rb1',
    clubId: 'c1',
    roomName: 'Central Auditorium',
    date: '2026-11-20',
    timeSlot: '09:00 AM - 01:00 PM',
    bookedAt: '2026-10-15T11:00:00.000Z',
    purpose: 'National Hackathon Opening Ceremony'
  },
  {
    id: 'rb2',
    clubId: 'c2',
    roomName: 'Conference Room A (Academic Bldg 1)',
    date: '2026-11-05',
    timeSlot: '02:00 PM - 04:00 PM',
    bookedAt: '2026-10-22T08:30:00.000Z',
    purpose: 'Executive Committee Strategy Meeting'
  },
  {
    id: 'rb3',
    clubId: 'c1',
    roomName: 'Seminar Hall 301',
    date: '2026-11-08',
    timeSlot: '03:00 PM - 05:00 PM',
    bookedAt: '2026-10-24T12:15:00.000Z',
    purpose: 'Algorithm DP Bootcamp'
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseSchema {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all collections exist
        return {
          users: parsed.users || INITIAL_USERS,
          clubs: parsed.clubs || INITIAL_CLUBS,
          memberships: parsed.memberships || INITIAL_MEMBERSHIPS,
          events: parsed.events || INITIAL_EVENTS,
          eventRegistrations: parsed.eventRegistrations || INITIAL_EVENT_REGISTRATIONS,
          announcements: parsed.announcements || INITIAL_ANNOUNCEMENTS,
          collaborationRequests: parsed.collaborationRequests || INITIAL_COLLABORATIONS,
          equipment: parsed.equipment || INITIAL_EQUIPMENT,
          roomBookings: parsed.roomBookings || INITIAL_ROOM_BOOKINGS,
          resetTokens: parsed.resetTokens || []
        };
      }
    } catch {
      // Fallback to initial
    }
    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      clubs: INITIAL_CLUBS,
      memberships: INITIAL_MEMBERSHIPS,
      events: INITIAL_EVENTS,
      eventRegistrations: INITIAL_EVENT_REGISTRATIONS,
      announcements: INITIAL_ANNOUNCEMENTS,
      collaborationRequests: INITIAL_COLLABORATIONS,
      equipment: INITIAL_EQUIPMENT,
      roomBookings: INITIAL_ROOM_BOOKINGS,
      resetTokens: []
    };
    this.saveToStorage(initial);
    return initial;
  }

  private saveToStorage(data: DatabaseSchema): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  public getSnapshot(): DatabaseSchema {
    return this.data;
  }

  public resetToDefaults(): void {
    this.data = {
      users: INITIAL_USERS,
      clubs: INITIAL_CLUBS,
      memberships: INITIAL_MEMBERSHIPS,
      events: INITIAL_EVENTS,
      eventRegistrations: INITIAL_EVENT_REGISTRATIONS,
      announcements: INITIAL_ANNOUNCEMENTS,
      collaborationRequests: INITIAL_COLLABORATIONS,
      equipment: INITIAL_EQUIPMENT,
      roomBookings: INITIAL_ROOM_BOOKINGS,
      resetTokens: []
    };
    this.saveToStorage(this.data);
  }

  // --- Users ---
  public findUserByEmailOrStudentId(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(
      (u) => u.email.toLowerCase() === clean || u.studentId.toLowerCase() === clean
    );
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByStudentId(studentId: string): User | undefined {
    return this.data.users.find((u) => u.studentId === studentId);
  }

  public addUser(user: User): void {
    this.data.users.push(user);
    this.saveToStorage(this.data);
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      this.saveToStorage(this.data);
      return this.data.users[index];
    }
    return undefined;
  }

  public getAllUsers(): User[] {
    return [...this.data.users];
  }

  // --- Clubs ---
  public getAllClubs(): Club[] {
    return [...this.data.clubs];
  }

  public getClubById(id: string): Club | undefined {
    return this.data.clubs.find((c) => c.id === id);
  }

  public addClub(club: Club): void {
    this.data.clubs.push(club);
    this.saveToStorage(this.data);
  }

  public updateClub(id: string, updates: Partial<Club>): Club | undefined {
    const index = this.data.clubs.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.data.clubs[index] = { ...this.data.clubs[index], ...updates };
      this.saveToStorage(this.data);
      return this.data.clubs[index];
    }
    return undefined;
  }

  public deleteClub(id: string): boolean {
    const initialLen = this.data.clubs.length;
    this.data.clubs = this.data.clubs.filter((c) => c.id !== id);
    // Cascade remove memberships, events, announcements for that club
    this.data.memberships = this.data.memberships.filter((m) => m.clubId !== id);
    this.data.events = this.data.events.filter((e) => e.clubId !== id);
    this.data.announcements = this.data.announcements.filter((a) => a.clubId !== id);
    this.saveToStorage(this.data);
    return this.data.clubs.length < initialLen;
  }

  // --- Memberships ---
  public getAllMemberships(): Membership[] {
    return [...this.data.memberships];
  }

  public getMembershipsByClub(clubId: string): Membership[] {
    return this.data.memberships.filter((m) => m.clubId === clubId);
  }

  public getMembershipsByStudent(studentId: string): Membership[] {
    return this.data.memberships.filter((m) => m.studentId === studentId);
  }

  public addMembership(membership: Membership): void {
    this.data.memberships.push(membership);
    this.saveToStorage(this.data);
  }

  public updateMembership(id: string, updates: Partial<Membership>): Membership | undefined {
    const index = this.data.memberships.findIndex((m) => m.id === id);
    if (index !== -1) {
      this.data.memberships[index] = { ...this.data.memberships[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveToStorage(this.data);
      return this.data.memberships[index];
    }
    return undefined;
  }

  // --- Events ---
  public getAllEvents(): Event[] {
    return [...this.data.events];
  }

  public getEventById(id: string): Event | undefined {
    return this.data.events.find((e) => e.id === id);
  }

  public getEventsByClub(clubId: string): Event[] {
    return this.data.events.filter((e) => e.clubId === clubId || e.coHostClubId === clubId);
  }

  public addEvent(event: Event): void {
    this.data.events.push(event);
    this.saveToStorage(this.data);
  }

  public updateEvent(id: string, updates: Partial<Event>): Event | undefined {
    const index = this.data.events.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.data.events[index] = { ...this.data.events[index], ...updates };
      this.saveToStorage(this.data);
      return this.data.events[index];
    }
    return undefined;
  }

  public deleteEvent(id: string): boolean {
    const initialLen = this.data.events.length;
    this.data.events = this.data.events.filter((e) => e.id !== id);
    this.data.eventRegistrations = this.data.eventRegistrations.filter((r) => r.eventId !== id);
    this.saveToStorage(this.data);
    return this.data.events.length < initialLen;
  }

  // --- Event Registrations ---
  public getAllEventRegistrations(): EventRegistration[] {
    return [...this.data.eventRegistrations];
  }

  public getRegistrationsByEvent(eventId: string): EventRegistration[] {
    return this.data.eventRegistrations.filter((r) => r.eventId === eventId);
  }

  public getRegistrationsByStudent(studentId: string): EventRegistration[] {
    return this.data.eventRegistrations.filter((r) => r.studentId === studentId);
  }

  public addEventRegistration(reg: EventRegistration): void {
    this.data.eventRegistrations.push(reg);
    this.saveToStorage(this.data);
  }

  // --- Announcements ---
  public getAllAnnouncements(): Announcement[] {
    return [...this.data.announcements];
  }

  public getAnnouncementsByClub(clubId: string): Announcement[] {
    return this.data.announcements.filter((a) => a.clubId === clubId);
  }

  public getAnnouncementById(id: string): Announcement | undefined {
    return this.data.announcements.find((a) => a.id === id);
  }

  public addAnnouncement(announcement: Announcement): void {
    this.data.announcements.push(announcement);
    this.saveToStorage(this.data);
  }

  public updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | undefined {
    const index = this.data.announcements.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.data.announcements[index] = {
        ...this.data.announcements[index],
        ...updates,
        editedAt: new Date().toISOString()
      };
      this.saveToStorage(this.data);
      return this.data.announcements[index];
    }
    return undefined;
  }

  public deleteAnnouncement(id: string): boolean {
    const initialLen = this.data.announcements.length;
    this.data.announcements = this.data.announcements.filter((a) => a.id !== id);
    this.saveToStorage(this.data);
    return this.data.announcements.length < initialLen;
  }

  // --- Collaboration Requests ---
  public getAllCollaborationRequests(): CollaborationRequest[] {
    return [...this.data.collaborationRequests];
  }

  public addCollaborationRequest(req: CollaborationRequest): void {
    this.data.collaborationRequests.push(req);
    this.saveToStorage(this.data);
  }

  public updateCollaborationRequest(id: string, updates: Partial<CollaborationRequest>): CollaborationRequest | undefined {
    const index = this.data.collaborationRequests.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.data.collaborationRequests[index] = { ...this.data.collaborationRequests[index], ...updates };
      this.saveToStorage(this.data);
      return this.data.collaborationRequests[index];
    }
    return undefined;
  }

  // --- Equipment ---
  public getAllEquipment(): Equipment[] {
    return [...this.data.equipment];
  }

  public addEquipment(eq: Equipment): void {
    this.data.equipment.push(eq);
    this.saveToStorage(this.data);
  }

  public updateEquipment(id: string, updates: Partial<Equipment>): Equipment | undefined {
    const index = this.data.equipment.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.data.equipment[index] = { ...this.data.equipment[index], ...updates };
      this.saveToStorage(this.data);
      return this.data.equipment[index];
    }
    return undefined;
  }

  public deleteEquipment(id: string): boolean {
    const initialLen = this.data.equipment.length;
    this.data.equipment = this.data.equipment.filter((e) => e.id !== id);
    this.saveToStorage(this.data);
    return this.data.equipment.length < initialLen;
  }

  // --- Room Bookings ---
  public getAllRoomBookings(): RoomBooking[] {
    return [...this.data.roomBookings];
  }

  public addRoomBooking(booking: RoomBooking): void {
    this.data.roomBookings.push(booking);
    this.saveToStorage(this.data);
  }

  // --- Password Reset Tokens ---
  public addResetToken(token: PasswordResetToken): void {
    this.data.resetTokens.push(token);
    this.saveToStorage(this.data);
  }

  public findValidResetToken(tokenString: string): PasswordResetToken | undefined {
    const now = new Date().toISOString();
    return this.data.resetTokens.find(
      (t) => t.token === tokenString && !t.used && t.expiresAt > now
    );
  }

  public markResetTokenUsed(tokenString: string): void {
    const token = this.data.resetTokens.find((t) => t.token === tokenString);
    if (token) {
      token.used = true;
      this.saveToStorage(this.data);
    }
  }
}

export const db = new DatabaseService();
