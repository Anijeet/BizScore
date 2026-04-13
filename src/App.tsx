import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import HomePage from '@/pages/Home'
import DocsPage from '@/pages/Docs'
import AssessmentPage from '@/pages/Assessment'
import Layer2Page from '@/pages/Layer2'
import Layer3Page from '@/pages/Layer3'
import FinalScorePage from '@/pages/FinalScore'
import DashboardLoginPage from '@/pages/dashboard/Login'
import DashboardPage from '@/pages/dashboard/Dashboard'
import ApplicationDetailPage from '@/pages/dashboard/ApplicationDetail'
import { isOfficerLoggedIn } from '@/services/storage'

// ─── Route guards ─────────────────────────────────────────────────────────────

/** Redirect non-officers away from /dashboard routes */
function RequireOfficer({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  if (!isOfficerLoggedIn()) {
    return <Navigate to="/dashboard/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

/** Redirect logged-in officers away from the login page */
function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  if (isOfficerLoggedIn()) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

// ─── Business owner layout ────────────────────────────────────────────────────

function BusinessLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/assess" element={<AssessmentPage />} />
          <Route path="/assess/layer2" element={<Layer2Page />} />
          <Route path="/assess/layer3" element={<Layer3Page />} />
          <Route path="/assess/score" element={<FinalScorePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

// ─── Root app ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Dashboard (officer) routes — full-screen, no public header/footer ── */}
        <Route
          path="/dashboard/login"
          element={
            <RedirectIfLoggedIn>
              <DashboardLoginPage />
            </RedirectIfLoggedIn>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireOfficer>
              <DashboardPage />
            </RequireOfficer>
          }
        />
        <Route
          path="/dashboard/applications/:id"
          element={
            <RequireOfficer>
              <ApplicationDetailPage />
            </RequireOfficer>
          }
        />

        {/* ── Business owner routes — with public header/footer ── */}
        <Route path="/*" element={<BusinessLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
