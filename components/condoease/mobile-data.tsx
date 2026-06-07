'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createRecord, listRecords, type ApiUser } from '@/lib/api'

export type BillStatus = 'paid' | 'unpaid' | 'overdue'

export interface Bill {
  id: string
  month: string
  dueDate: string
  amount: number
  status: BillStatus
  paidDate?: string
  breakdown: { label: string; amount: number }[]
  receiptNumber?: string
  referenceCode?: string
  verificationHash?: string
  providerReference?: string
  chainSequence?: number
}

export type MaintenanceStatus = 'pending' | 'in-progress' | 'resolved' | 'cancelled'
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'

export interface MaintenanceRequest {
  id: string
  title: string
  category: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  submittedDate: string
  updatedDate: string
  assignedTo?: string
  notes?: string
}

export interface Announcement {
  id: string
  title: string
  date: string
  category: string
  content: string
  important: boolean
}

export interface TenantSummary {
  name: string
  unit: string
  building: string
  email: string
  phone: string
  floor: string
  address: string
  avatar: string
  balance: number
  nextDueDate: string
  nextDueAmount: number
}

type MobileData = {
  tenant: TenantSummary
  bills: Bill[]
  maintenanceRequests: MaintenanceRequest[]
  announcements: Announcement[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createMaintenanceRequest: (payload: {
    title: string
    category: string
    priority: MaintenancePriority
    description: string
  }) => Promise<void>
}

type PaymentRecord = {
  _id: string
  amount: number
  dueDate: string
  paymentDate?: string
  method?: string
  txHash?: string
  providerTransactionId?: string
  referenceCode?: string
  chainHash?: string
  chainSequence?: number
  month?: string
  status: 'Paid' | 'Pending' | 'Overdue'
  unitNumber?: string
  buildingName?: string
}

type AnnouncementRecord = {
  _id: string
  title: string
  content: string
  priority: 'Low' | 'Medium' | 'High'
  category: string
  pinned?: boolean
  publishedAt?: string
  createdAt?: string
}

type MaintenanceRecord = {
  _id: string
  maintenanceType?: 'Emergency' | 'Routine'
  category: string
  status: 'Pending' | 'Ongoing' | 'Completed'
  description: string
  comment?: string
  resolutionSummary?: string
  createdAt?: string
  updatedAt?: string
}

type LeaseRecord = {
  propertyName: string
  unitNumber: string
  unitType?: string
  status: 'Active' | 'Terminated'
}

const emptyTenant: TenantSummary = {
  name: '',
  unit: '',
  building: '',
  email: '',
  phone: '',
  floor: '',
  address: '',
  avatar: '',
  balance: 0,
  nextDueDate: '',
  nextDueAmount: 0,
}

const MobileDataContext = createContext<MobileData | null>(null)

export function MobileDataProvider({ user, children }: { user: ApiUser | null; children: ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [lease, setLease] = useState<LeaseRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tenant = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    const activeBill = bills.find(bill => bill.status !== 'paid')
    const unit = lease?.unitNumber ? `Unit ${lease.unitNumber}` : ''

    return {
      name: fullName,
      unit,
      building: lease?.propertyName || '',
      email: user?.email || '',
      phone: user?.contactNumber || '',
      floor: lease?.unitType || '',
      address: [user?.unitStreet, user?.barangay, user?.city, user?.region].filter(Boolean).join(', '),
      avatar: [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') || fullName.slice(0, 2).toUpperCase(),
      balance: bills.filter(bill => bill.status !== 'paid').reduce((sum, bill) => sum + bill.amount, 0),
      nextDueDate: activeBill?.dueDate || '',
      nextDueAmount: activeBill?.amount || 0,
    }
  }, [bills, lease, user])

  const refresh = useCallback(async () => {
    if (!user) {
      setBills([])
      setMaintenanceRequests([])
      setAnnouncements([])
      setLease(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [paymentsResult, maintenanceResult, announcementsResult, leasesResult] = await Promise.all([
        listRecords<PaymentRecord>('/payments', { limit: 100, sort: 'dueDate' }),
        listRecords<MaintenanceRecord>('/maintenance-requests', { limit: 100 }),
        listRecords<AnnouncementRecord>('/announcements', { limit: 100, sort: '-publishedAt' }),
        listRecords<LeaseRecord>('/leases', { limit: 20 }),
      ])

      setBills(paymentsResult.items.map(mapPayment))
      setMaintenanceRequests(maintenanceResult.items.map(mapMaintenance))
      setAnnouncements(announcementsResult.items.map(mapAnnouncement))
      setLease(leasesResult.items.find(item => item.status === 'Active') ?? leasesResult.items[0] ?? null)
    } catch (dataError) {
      setError(dataError instanceof Error ? dataError.message : 'Unable to load mobile data.')
    } finally {
      setLoading(false)
    }
  }, [user])

  const createMaintenanceRequest = useCallback(async (payload: {
    title: string
    category: string
    priority: MaintenancePriority
    description: string
  }) => {
    await createRecord<MaintenanceRecord>('/maintenance-requests', {
      category: payload.category,
      maintenanceType: payload.priority === 'urgent' ? 'Emergency' : 'Routine',
      description: `${payload.title}\n\n${payload.description}`,
    })
    await refresh()
  }, [refresh])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(() => ({
    tenant: tenant.name ? tenant : emptyTenant,
    bills,
    maintenanceRequests,
    announcements,
    loading,
    error,
    refresh,
    createMaintenanceRequest,
  }), [announcements, bills, createMaintenanceRequest, error, loading, maintenanceRequests, refresh, tenant])

  return <MobileDataContext.Provider value={value}>{children}</MobileDataContext.Provider>
}

export function useMobileData() {
  const context = useContext(MobileDataContext)
  if (!context) throw new Error('useMobileData must be used inside MobileDataProvider')
  return context
}

function mapPayment(payment: PaymentRecord): Bill {
  const due = new Date(payment.dueDate)
  const status = payment.status === 'Paid' ? 'paid' : payment.status === 'Overdue' ? 'overdue' : 'unpaid'

  return {
    id: payment._id,
    month: payment.month || due.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
    dueDate: formatDate(payment.dueDate),
    amount: payment.amount,
    status,
    paidDate: payment.paymentDate ? formatDate(payment.paymentDate) : undefined,
    receiptNumber: payment.referenceCode || payment.providerTransactionId || payment.txHash,
    referenceCode: payment.referenceCode,
    verificationHash: payment.chainHash,
    providerReference: payment.providerTransactionId,
    chainSequence: payment.chainSequence,
    breakdown: [{ label: 'Condo dues and charges', amount: payment.amount }],
  }
}

function mapMaintenance(request: MaintenanceRecord): MaintenanceRequest {
  const [titleLine, ...descriptionLines] = request.description.split('\n')
  const title = titleLine.trim() || request.category
  const description = descriptionLines.join('\n').trim() || request.description

  return {
    id: request._id,
    title,
    category: request.category,
    description,
    priority: request.maintenanceType === 'Emergency' ? 'urgent' : 'medium',
    status: request.status === 'Completed' ? 'resolved' : request.status === 'Ongoing' ? 'in-progress' : 'pending',
    submittedDate: formatDate(request.createdAt),
    updatedDate: formatDate(request.updatedAt),
    notes: request.resolutionSummary || request.comment,
  }
}

function mapAnnouncement(announcement: AnnouncementRecord): Announcement {
  return {
    id: announcement._id,
    title: announcement.title,
    content: announcement.content,
    category: announcement.category,
    date: formatDate(announcement.publishedAt || announcement.createdAt),
    important: announcement.pinned || announcement.priority === 'High',
  }
}

function formatDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
