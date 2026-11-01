import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { RoleQuickSwitcher } from './components/layout/RoleQuickSwitcher';
import { AccessDenied } from './components/common/AccessDenied';

// Auth Components
import { LoginStudent } from './components/auth/LoginStudent';
import { LoginClubAdmin } from './components/auth/LoginClubAdmin';
import { LoginSuperAdmin } from './components/auth/LoginSuperAdmin';
import { SignupStudent } from './components/auth/SignupStudent';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { AccountSettings } from './components/auth/AccountSettings';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { BrowseClubs } from './components/student/BrowseClubs';
import { MyClubs } from './components/student/MyClubs';
import { EventsCatalog } from './components/student/EventsCatalog';
import { MyEventsAndApplications } from './components/student/MyEventsAndApplications';
import { StudentAnnouncements } from './components/student/StudentAnnouncements';

// Club Admin Components
import { ClubAdminDashboard } from './components/clubAdmin/ClubAdminDashboard';
import { ManageMembers } from './components/clubAdmin/ManageMembers';
import { PendingApplications } from './components/clubAdmin/PendingApplications';
import { EventManagement } from './components/clubAdmin/EventManagement';
import { AnnouncementManagement } from './components/clubAdmin/AnnouncementManagement';
import { CollaborationHub } from './components/clubAdmin/CollaborationHub';
import { EquipmentManagement } from './components/clubAdmin/EquipmentManagement';
import { RoomAllocation } from './components/clubAdmin/RoomAllocation';

// Super Admin Components
import { SuperAdminDashboard } from './components/superAdmin/SuperAdminDashboard';

const AppContent: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  // Current view identifier
  const [currentView, setCurrentView] = useState<string>('student-dashboard');

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash === 'admin/login') {
        setCurrentView('admin-login');
      } else if (hash === 'admin') {
        setCurrentView('admin-dashboard');
      } else if (hash === 'club/login') {
        setCurrentView('club-login');
      } else if (hash === 'login') {
        setCurrentView('student-login');
      } else if (hash === 'signup') {
        setCurrentView('signup');
      } else if (hash === 'clubs') {
        setCurrentView('browse-clubs');
      } else if (hash === 'events') {
        setCurrentView('events');
      } else if (hash) {
        setCurrentView(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Initializing BAUST Club System...</p>
        </div>
      </div>
    );
  }

  // Render view with strict role protection
  const renderView = () => {
    // -------------------------------------------------------------
    // AUTH VIEWS
    // -------------------------------------------------------------
    if (currentView === 'student-login') {
      return (
        <div className="py-12 px-4">
          <LoginStudent
            onSuccess={() => navigateTo('student-dashboard')}
            onGoToSignup={() => navigateTo('signup')}
            onForgotPassword={() => setIsForgotModalOpen(true)}
          />
        </div>
      );
    }

    if (currentView === 'club-login') {
      return (
        <div className="py-12 px-4">
          <LoginClubAdmin
            onSuccess={() => navigateTo('club-dashboard')}
            onForgotPassword={() => setIsForgotModalOpen(true)}
          />
        </div>
      );
    }

    // Module 1, Requirement 4: ASW Admin Login (Separate route /admin/login)
    if (currentView === 'admin-login') {
      return (
        <div className="py-12 px-4">
          <LoginSuperAdmin
            onSuccess={() => navigateTo('admin-dashboard')}
            onForgotPassword={() => setIsForgotModalOpen(true)}
          />
        </div>
      );
    }

    if (currentView === 'signup') {
      return (
        <div className="py-12 px-4">
          <SignupStudent
            onSuccess={() => navigateTo('student-login')}
            onGoToLogin={() => navigateTo('student-login')}
          />
        </div>
      );
    }

    // -------------------------------------------------------------
    // COMMON AUTHENTICATED
    // -------------------------------------------------------------
    if (currentView === 'account-settings') {
      if (!user) {
        return (
          <AccessDenied
            requiredRole="Authenticated User"
            onNavigateHome={() => navigateTo('student-dashboard')}
            onOpenLogin={() => navigateTo('student-login')}
          />
        );
      }
      return <AccountSettings />;
    }

    // -------------------------------------------------------------
    // SUPER ADMIN VIEWS (Protected to superAdmin)
    // -------------------------------------------------------------
    if (currentView === 'admin-dashboard') {
      if (role !== 'superAdmin') {
        return (
          <AccessDenied
            requiredRole="Super Admin (ASW)"
            onNavigateHome={() => navigateTo('student-dashboard')}
            onOpenLogin={() => navigateTo('admin-login')}
          />
        );
      }
      return <SuperAdminDashboard />;
    }

    // -------------------------------------------------------------
    // CLUB ADMIN VIEWS (Protected to clubAdmin)
    // -------------------------------------------------------------
    if (
      [
        'club-dashboard',
        'manage-members',
        'pending-applications',
        'manage-events',
        'manage-announcements',
        'collaboration-hub',
        'equipment-management'
      ].includes(currentView)
    ) {
      if (role !== 'clubAdmin') {
        return (
          <AccessDenied
            requiredRole="Club President (Club Admin)"
            onNavigateHome={() => navigateTo('student-dashboard')}
            onOpenLogin={() => navigateTo('club-login')}
          />
        );
      }

      switch (currentView) {
        case 'club-dashboard':
          return <ClubAdminDashboard onNavigate={navigateTo} />;
        case 'manage-members':
          return <ManageMembers />;
        case 'pending-applications':
          return <PendingApplications />;
        case 'manage-events':
          return <EventManagement />;
        case 'manage-announcements':
          return <AnnouncementManagement />;
        case 'collaboration-hub':
          return <CollaborationHub />;
        case 'equipment-management':
          return <EquipmentManagement />;
      }
    }

    // Room Allocation (Accessible by Club Admin & Super Admin)
    if (currentView === 'room-allocation') {
      if (role !== 'clubAdmin' && role !== 'superAdmin') {
        return (
          <AccessDenied
            requiredRole="Club President or ASW Administrator"
            onNavigateHome={() => navigateTo('student-dashboard')}
            onOpenLogin={() => navigateTo('club-login')}
          />
        );
      }
      return <RoomAllocation />;
    }

    // -------------------------------------------------------------
    // STUDENT VIEWS
    // -------------------------------------------------------------
    if (currentView === 'my-clubs') {
      if (role !== 'student') {
        return (
          <AccessDenied
            requiredRole="Student"
            onNavigateHome={() => navigateTo('club-dashboard')}
          />
        );
      }
      return <MyClubs onBrowseClubs={() => navigateTo('browse-clubs')} />;
    }

    if (currentView === 'my-applications') {
      if (role !== 'student') {
        return (
          <AccessDenied
            requiredRole="Student"
            onNavigateHome={() => navigateTo('club-dashboard')}
          />
        );
      }
      return (
        <MyEventsAndApplications
          onBrowseEvents={() => navigateTo('events')}
          onBrowseClubs={() => navigateTo('browse-clubs')}
        />
      );
    }

    if (currentView === 'browse-clubs') {
      return <BrowseClubs />;
    }

    if (currentView === 'events') {
      return <EventsCatalog />;
    }

    if (currentView === 'announcements') {
      return <StudentAnnouncements />;
    }

    // Default: student dashboard
    return <StudentDashboard onNavigate={navigateTo} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Interactive tester bar for seamless role switching */}
      <RoleQuickSwitcher
        onNavigate={navigateTo}
        onOpenLogin={(targetRole) => {
          if (targetRole === 'superAdmin') navigateTo('admin-login');
          else if (targetRole === 'clubAdmin') navigateTo('club-login');
          else navigateTo('student-login');
        }}
      />

      {/* Main Role-Based Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenLogin={(targetRole) => {
          if (targetRole === 'superAdmin') navigateTo('admin-login');
          else if (targetRole === 'clubAdmin') navigateTo('club-login');
          else navigateTo('student-login');
        }}
        onOpenSignup={() => navigateTo('signup')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-800">BAUST Club Management System</span>
            <span className="mx-2">·</span>
            <span>Bangladesh Army University of Science and Technology, Saidpur Cantonment</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Directorate of Students Welfare (ASW)</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => navigateTo('admin-login')}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              ASW Login
            </button>
          </div>
        </div>
      </footer>

      {/* Global Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onPasswordResetComplete={() => navigateTo('student-login')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
