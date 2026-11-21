import { Capacitor } from "@capacitor/core"
import type { Bill, TenantSummary } from "./mobile-data"

export function buildPaymentReceiptText(bill: Bill, tenant: TenantSummary) {
  return [
    "CondoEase Payment Receipt",
    `Reference: ${bill.referenceCode || bill.receiptNumber || fallbackReference(bill.id)}`,
    `Tenant: ${tenant.name}`,
    `Unit: ${tenant.unit}`,
    `Building: ${tenant.building}`,
    `Billing Period: ${bill.month}`,
    `Amount Paid: PHP ${bill.amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Payment Date: ${bill.paidDate || "-"}`,
    `Verification Hash: ${bill.verificationHash || "-"}`,
    `Provider Transaction ID: ${bill.providerReference || "-"}`,
  ].join("\n")
}

export async function sharePaymentReceipt(bill: Bill, tenant: TenantSummary) {
  const text = buildPaymentReceiptText(bill, tenant)

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: "CondoEase Payment Receipt",
        text,
      })
      return "Receipt shared."
    } catch (error) {
      // The user closed the share sheet: not an error worth reporting.
      if (error instanceof DOMException && error.name === "AbortError") return ""
      // Otherwise (e.g. NotAllowedError) fall through to copying the receipt.
    }
  }

  await copyText(text)
  return "Receipt copied to clipboard."
}

// The Android WebView has no Web Share API and may reject navigator.clipboard, so keep a legacy copy fallback.
async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall back to execCommand below.
    }
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "absolute"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand("copy")
  textarea.remove()

  if (!copied) throw new Error("Unable to copy receipt.")
}

export async function downloadPaymentReceipt(bill: Bill, tenant: TenantSummary) {
  // Capacitor's Android WebView ignores <a download> blob links, so the native app shares/copies the receipt instead.
  if (Capacitor.isNativePlatform()) {
    return sharePaymentReceipt(bill, tenant)
  }

  const blob = new Blob([buildPaymentReceiptText(bill, tenant)], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `${bill.referenceCode || fallbackReference(bill.id)}-receipt.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoking synchronously can cancel the download before the browser has read the blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return "Receipt downloaded."
}

export function fallbackReference(id: string) {
  return `PAY-${id.slice(-8).toUpperCase()}`
}
