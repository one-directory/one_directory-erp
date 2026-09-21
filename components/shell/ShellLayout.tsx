'use client';

import React, { useState } from 'react';
import { ERPProvider } from '@/context/ERPContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { hasModuleAccess } from '@/lib/rbac';
import { Sidebar, NavigationModule } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from './CommandPalette';
import { DetailDrawerManager } from './DetailDrawerManager';
import { GlobalModals } from './GlobalModals';
import { ToastContainer } from '@/components/ui/Toast';
import { LoginView } from '@/components/auth/LoginView';
import { AccessDeniedView } from '@/components/auth/AccessDeniedView';

// Modules
import { DashboardView } from '@/components/modules/dashboard/DashboardView';
import { FollowUpCenterView } from '@/components/modules/crm/FollowUpCenterView';
import { LeadsPipelineView } from '@/components/modules/crm/LeadsPipelineView';
import { QuotationsView } from '@/components/modules/crm/QuotationsView';
import { CommunicationsView } from '@/components/modules/crm/CommunicationsView';
import { ReservationCalendarView } from '@/components/modules/reservations/ReservationCalendarView';
import { ReservationsListView } from '@/components/modules/reservations/ReservationsListView';
import { GuestsView } from '@/components/modules/guests/GuestsView';
import { PropertiesListView } from '@/components/modules/properties/PropertiesListView';
import { PropertyDetailView } from '@/components/modules/properties/PropertyDetailView';
import { UnitTypesView } from '@/components/modules/properties/UnitTypesView';
import { UnitsInventoryView } from '@/components/modules/properties/UnitsInventoryView';
import { HousekeepingView } from '@/components/modules/operations/HousekeepingView';
import { MaintenanceView } from '@/components/modules/operations/MaintenanceView';
import { StaffTasksView } from '@/components/modules/operations/StaffTasksView';
import { FinanceOverviewView } from '@/components/modules/finance/FinanceOverviewView';
import { ReviewsView } from '@/components/modules/reviews/ReviewsView';
import { ReportsView } from '@/components/modules/reports/ReportsView';
import { AuditTrailView } from '@/components/modules/audit/AuditTrailView';
import { SettingsView } from '@/components/modules/settings/SettingsView';
import { ChannelManagerView } from '@/components/modules/channels/ChannelManagerView';

function ShellInner() {
  const { user, isLoading } = useAuth();
  const [currentModule, setCurrentModule] = useState<NavigationModule>('dashboard');
  const [selectedPropertyDetailId, setSelectedPropertyDetailId] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Show loading spinner while restoring session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading One Directory ERP...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginView />;
  }

  const handleSelectModule = (mod: NavigationModule) => {
    setCurrentModule(mod);
    setSelectedPropertyDetailId(null);
  };

  const handleSelectProperty = (propId: string) => {
    setSelectedPropertyDetailId(propId);
  };

  const renderCurrentModule = () => {
    // Role-based access check (except dashboard which is always accessible)
    if (currentModule !== 'dashboard' && !hasModuleAccess(user.role, currentModule)) {
      return (
        <AccessDeniedView
          module={currentModule}
          onBack={() => setCurrentModule('dashboard')}
        />
      );
    }

    // If exploring a single property detail
    if (currentModule === 'properties' && selectedPropertyDetailId) {
      return (
        <PropertyDetailView
          propertyId={selectedPropertyDetailId}
          onBack={() => setSelectedPropertyDetailId(null)}
        />
      );
    }

    switch (currentModule) {
      case 'dashboard':
        return <DashboardView />;
      case 'follow-ups':
        return <FollowUpCenterView />;
      case 'leads':
        return <LeadsPipelineView />;
      case 'quotations':
        return <QuotationsView />;
      case 'communications':
        return <CommunicationsView />;
      case 'calendar':
        return <ReservationCalendarView />;
      case 'reservations':
        return <ReservationsListView />;
      case 'guests':
        return <GuestsView />;
      case 'properties':
        return <PropertiesListView onSelectProperty={handleSelectProperty} />;
      case 'unit-types':
        return <UnitTypesView />;
      case 'units':
        return <UnitsInventoryView />;
      case 'housekeeping':
        return <HousekeepingView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'staff-tasks':
        return <StaffTasksView />;
      case 'finance':
      case 'payments':
        return <FinanceOverviewView initialTab="payments" />;
      case 'invoices':
        return <FinanceOverviewView initialTab="invoices" />;
      case 'expenses':
        return <FinanceOverviewView initialTab="expenses" />;
      case 'owner-settlements':
        return <FinanceOverviewView initialTab="settlements" />;
      case 'reviews':
        return <ReviewsView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditTrailView />;
      case 'settings':
        return <SettingsView />;
      case 'channels':
        return <ChannelManagerView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <ERPProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 antialiased font-sans">
        {/* Left Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={handleSelectModule}
          isOpenMobile={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Bar */}
          <TopBar onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />

          {/* Page Content Scroll Container */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto">{renderCurrentModule()}</div>
          </main>

          {/* Bottom Navigation for Mobile Devices */}
          <MobileNav
            currentModule={currentModule}
            onSelectModule={handleSelectModule}
            onOpenMoreMenu={() => setIsMobileDrawerOpen(true)}
          />
        </div>

        {/* Global Overlays */}
        <CommandPalette onNavigate={handleSelectModule} />
        <DetailDrawerManager />
        <GlobalModals />
        <ToastContainer />
      </div>
    </ERPProvider>
  );
}

export function ShellLayout() {
  return (
    <AuthProvider>
      <ShellInner />
    </AuthProvider>
  );
}
