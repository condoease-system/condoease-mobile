'use client'

import { useState, useCallback, useEffect, useRef, type ReactNode, type TouchEvent } from 'react'
import { SplashScreen } from './SplashScreen'
import { LoginScreen } from './LoginScreen'
import { SignUpScreen } from './SignUpScreen'
import { HomeScreen } from './HomeScreen'
import { BillsScreen } from './BillsScreen'
import { BillDetailScreen } from './BillDetailScreen'
import { PayBillScreen } from './PayBillScreen'
import { PaymentSuccessScreen } from './PaymentSuccessScreen'
import { PaymentHistoryScreen } from './PaymentHistoryScreen'
import { ReceiptScreen } from './ReceiptScreen'
import { MaintenanceScreen } from './MaintenanceScreen'
import { MaintenanceFormScreen } from './MaintenanceFormScreen'
import { MaintenanceDetailScreen } from './MaintenanceDetailScreen'
import { AnnouncementsScreen } from './AnnouncementsScreen'
import { AnnouncementDetailScreen } from './AnnouncementDetailScreen'
import { ProfileScreen } from './ProfileScreen'
import { NotificationsScreen } from './NotificationsScreen'
import { BottomNav } from './BottomNav'
import { ApiError, SESSION_EXPIRED_EVENT, clearAuthSession, getCurrentUser, getStoredUser, type ApiUser } from '@/lib/api'
import { MobileDataProvider, useMobileData } from './mobile-data'

type AppScreen =
  | 'splash'
  | 'login'
  | 'sign-up'
  | 'home'
  | 'bills'
  | 'bill-detail'
  | 'pay-bill'
  | 'payment-success'
  | 'payment-history'
  | 'receipt'
  | 'maintenance'
  | 'maintenance-form'
  | 'maintenance-detail'
  | 'announcements'
  | 'announcement-detail'
  | 'notifications'
  | 'profile'

interface NavState {
  screen: AppScreen
  params?: Record<string, unknown>
}

export function CondoEaseApp() {
  const [history, setHistory] = useState<NavState[]>([{ screen: 'splash' }])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<ApiUser | null>(null)

  const current = history[history.length - 1]
  const initialSearchRef = useRef<string | null>(null)

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null)
      setIsLoggedIn(false)
      setHistory([{ screen: 'login' }])
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [])

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
      // Keep the original query: it is stripped below, and a re-run effect (Strict Mode) must still see the payment return params.
      if (initialSearchRef.current === null) initialSearchRef.current = window.location.search
      const params = new URLSearchParams(initialSearchRef.current)
      const paymentStatus = params.get('paymentStatus')
      const billId = params.get('billId') || ''
      const storedUser = getStoredUser()

      if (paymentStatus) {
        window.history.replaceState({}, '', window.location.pathname)

        if (!storedUser) {
          setHistory([{ screen: 'login' }])
          return
        }

        setUser(storedUser)
        setIsLoggedIn(true)

        if (paymentStatus !== 'success' || !billId) {
          setHistory([{ screen: billId ? 'pay-bill' : 'bills', params: billId ? { billId } : undefined }])
          return
        }

        if (!cancelled) setHistory([{ screen: 'receipt', params: { billId, method: 'xendit', auto: true } }])
        return
      }

      if (!storedUser) return

      setUser(storedUser)
      setIsLoggedIn(true)
      setHistory([{ screen: 'home' }])

      try {
        const { user: refreshedUser } = await getCurrentUser()
        if (!cancelled) setUser(refreshedUser)
      } catch (error) {
        // Only an auth rejection ends the session; offline/server errors keep the stored user signed in.
        if (cancelled || !(error instanceof ApiError && error.status === 401)) return
        clearAuthSession()
        setUser(null)
        setIsLoggedIn(false)
        setHistory([{ screen: 'login' }])
      }
    }

    void initialize()
    return () => {
      cancelled = true
    }
  }, [])

  const navigate = useCallback((screen: string, params?: Record<string, unknown>) => {
    setHistory(prev => [...prev, { screen: screen as AppScreen, params }])
  }, [])

  const goBack = useCallback(() => {
    // Tab roots and deep-link entries (e.g. payment return) have no previous entry; fall back to Home instead of doing nothing.
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : [{ screen: 'home' }]))
  }, [])

  const renderScreen = () => {
    const { screen, params } = current

    switch (screen) {
      case 'splash':
        return <SplashScreen onComplete={() => setHistory([{ screen: 'login' }])} />

      case 'login':
        return <LoginScreen onSignUp={() => navigate('sign-up')} onLogin={(loggedInUser) => { setUser(loggedInUser); setIsLoggedIn(true); setHistory([{ screen: 'home' }]) }} />

      case 'sign-up':
        return <SignUpScreen onBack={() => setHistory([{ screen: 'login' }])} />

      case 'home':
        return <HomeScreen user={user} onNavigate={navigate} />

      case 'bills':
        return <BillsScreen onNavigate={navigate} />

      case 'bill-detail':
        return <BillDetailScreen billId={(params?.billId as string) ?? ''} onNavigate={navigate} onBack={goBack} />

      case 'pay-bill':
        return <PayBillScreen billId={params?.billId as string} onNavigate={navigate} onBack={goBack} />

      case 'payment-success':
        return <PaymentSuccessScreen billId={(params?.billId as string) ?? ''} method={params?.method as string} onNavigate={navigate} />

      case 'payment-history':
        return <PaymentHistoryScreen onNavigate={navigate} />

      case 'receipt':
        return <ReceiptScreen billId={(params?.billId as string) ?? ''} onBack={goBack} autoConfirmed={Boolean(params?.auto)} />

      case 'maintenance':
        return <MaintenanceScreen onNavigate={navigate} />

      case 'maintenance-form':
        return <MaintenanceFormScreen onNavigate={navigate} onBack={goBack} />

      case 'maintenance-detail':
        return <MaintenanceDetailScreen requestId={(params?.requestId as string) ?? ''} onBack={goBack} />

      case 'announcements':
        return <AnnouncementsScreen onNavigate={navigate} onBack={history.length > 1 ? goBack : undefined} />

      case 'announcement-detail':
        return <AnnouncementDetailScreen announcementId={(params?.announcementId as string) ?? ''} onBack={goBack} />

      case 'notifications':
        return <NotificationsScreen initialTab={params?.tab as 'notifications' | 'announcements' | undefined} onBack={goBack} onNavigate={navigate} />

      case 'profile':
        return <ProfileScreen user={user} onUserUpdate={setUser} onLogout={() => { clearAuthSession(); setUser(null); setIsLoggedIn(false); setHistory([{ screen: 'login' }]) }} />

      default:
        return <HomeScreen user={user} onNavigate={navigate} />
    }
  }

  const showNav = isLoggedIn && !['splash', 'login', 'sign-up', 'payment-success'].includes(current.screen)

  // For tab navigation, push a fresh tab screen
  const handleTabNav = (screen: string) => {
    setHistory([{ screen: screen as AppScreen }])
  }

  return (
    <MobileDataProvider user={user}>
      <PullToRefresh>
        <div className="flex h-full flex-col overflow-hidden bg-background">
          {/* Screen area */}
          {/* Keyed by stack depth so a screen reached again via a tab remounts instead of keeping stale state (e.g. an open pay sheet). */}
          <div key={history.length} className="flex-1 overflow-hidden relative">
            {renderScreen()}
          </div>

          {/* Bottom Nav */}
          {showNav && (
            <BottomNav active={current.screen} onNavigate={handleTabNav} />
          )}
        </div>
      </PullToRefresh>
    </MobileDataProvider>
  )
}

function PullToRefresh({ children }: { children: ReactNode }) {
  const { refresh, loading } = useMobileData()
  const startYRef = useRef(0)
  const pullingRef = useRef(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const threshold = 78

  const findScrollContainer = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return null
    return target.closest('.mobile-scroll') as HTMLElement | null
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const scrollContainer = findScrollContainer(event.target)
    pullingRef.current = !scrollContainer || scrollContainer.scrollTop <= 0
    startYRef.current = event.touches[0]?.clientY ?? 0
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!pullingRef.current || refreshing || loading) return

    const delta = (event.touches[0]?.clientY ?? 0) - startYRef.current
    if (delta <= 0) {
      setPullDistance(0)
      return
    }

    setPullDistance(Math.min(delta * 0.45, 104))
  }

  const handleTouchEnd = () => {
    if (!pullingRef.current) return

    pullingRef.current = false
    if (pullDistance < threshold || refreshing || loading) {
      setPullDistance(0)
      return
    }

    setRefreshing(true)
    setPullDistance(threshold)
    refresh()
      .catch(() => undefined)
      .finally(() => {
        setRefreshing(false)
        setPullDistance(0)
      })
  }

  const indicatorText = refreshing || loading
    ? 'Refreshing...'
    : pullDistance >= threshold
      ? 'Release to refresh'
      : 'Pull to refresh'

  return (
    <div
      className="relative h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-50 flex justify-center transition-transform duration-150"
        style={{ transform: `translateY(${pullDistance ? 10 : -58}px)` }}
      >
        <div className="mt-2 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-sm">
          <span
            className={refreshing || loading ? 'h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' : 'h-2 w-2 rounded-full bg-emerald-500'}
          />
          {indicatorText}
        </div>
      </div>
      {children}
    </div>
  )
}
