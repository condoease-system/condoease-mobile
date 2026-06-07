import type { Bill, TenantSummary } from "./mobile-data"

export function buildPaymentReceiptText(bill: Bill, tenant: TenantSummary) {
  return [
    "CondoEase Payment Receipt",
    `Reference: ${bill.referenceCode || bill.receiptNumber || fallbackReference(bill.id)}`,
    `Tenant: ${tenant.name}`,
    `Unit: ${tenant.unit}`,
    `Building: ${tenant.building}`,
    `Billing Period: ${bill.month}`,
    `Amount Paid: PHP ${bill.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
    `Payment Date: ${bill.paidDate || "-"}`,
    `Verification Hash: ${bill.verificationHash || "-"}`,
    `Provider Transaction ID: ${bill.providerReference || "-"}`,
  ].join("\n")
}

export async function sharePaymentReceipt(bill: Bill, tenant: TenantSummary) {
  const text = buildPaymentReceiptText(bill, tenant)

  if (navigator.share) {
    await navigator.share({
      title: "CondoEase Payment Receipt",
      text,
    })
    return "Receipt shared."
  }

  await navigator.clipboard.writeText(text)
  return "Receipt copied to clipboard."
}

export function downloadPaymentReceipt(bill: Bill, tenant: TenantSummary) {
  const blob = new Blob([buildPaymentReceiptText(bill, tenant)], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `${bill.referenceCode || fallbackReference(bill.id)}-receipt.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function fallbackReference(id: string) {
  return `PAY-${id.slice(-8).toUpperCase()}`
}
