import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, Payment } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { objectIdSchema } from "@/lib/security-schemas";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { id: rawId } = await context.params;
    const jobId = objectIdSchema.parse(rawId);

    const job = await Job.findById(jobId)
      .populate("customerId", "name phone email")
      .populate("workerId", "name phone")
      .populate("categoryId", "name slug")
      .lean();

    if (!job) {
      return errorResponse("Job not found", 404);
    }

    // Role-based authorization: only customer, assigned worker, or admin can access invoice
    const customerIdStr = (job.customerId as any)?._id?.toString() || job.customerId?.toString();
    const workerIdStr = (job.workerId as any)?._id?.toString() || job.workerId?.toString();

    const isCustomer = authUser.role === "customer" && authUser.userId === customerIdStr;
    const isWorker = authUser.role === "worker" && authUser.userId === workerIdStr;
    const isAdmin = authUser.role === "admin";

    if (!isCustomer && !isWorker && !isAdmin) {
      return errorResponse("Forbidden - Not authorized to view this invoice", 403, "FORBIDDEN");
    }

    // Fetch payment record if any
    const payment = await Payment.findOne({ jobId: job._id }).lean();

    // Financial calculations
    const baseAmount = job.finalPrice || job.estimatedPrice || 0;

    const materialsTotal = (job.materials || []).reduce(
      (sum: number, m: any) => sum + (m.totalPrice || (m.quantity * m.unitPrice) || 0),
      0
    );

    const approvedAdditionalCharges = (job.additionalCharges || []).filter(
      (c: any) => c.status === "approved"
    );
    const additionalChargesTotal = approvedAdditionalCharges.reduce(
      (sum: number, c: any) => sum + (c.amount || 0),
      0
    );

    const subtotal = baseAmount + materialsTotal + additionalChargesTotal;
    const discount = (job as any).discount || 0;
    const taxableAmount = Math.max(0, subtotal - discount);

    // 18% GST (9% CGST + 9% SGST)
    const cgstRate = 0.09;
    const sgstRate = 0.09;
    const cgstAmount = Math.round(taxableAmount * cgstRate * 100) / 100;
    const sgstAmount = Math.round(taxableAmount * sgstRate * 100) / 100;
    const totalTax = Math.round((cgstAmount + sgstAmount) * 100) / 100;
    const grandTotal = Math.round((taxableAmount + totalTax) * 100) / 100;

    const invoiceDate = job.endTime || job.updatedAt || new Date();
    const invoiceNumber = `KD-INV-${new Date(invoiceDate).getFullYear()}-${job.jobNumber || job._id.toString().slice(-6).toUpperCase()}`;

    const invoiceData = {
      invoiceNumber,
      invoiceDate: new Date(invoiceDate).toISOString(),
      jobNumber: job.jobNumber,
      serviceCategory: (job.categoryId as any)?.name || "Home Service",
      sacCode: "9987", // SAC code for Maintenance and repair services
      company: {
        legalName: "KaamDo Technologies Private Limited",
        tradeName: "KaamDo",
        gstin: "29AABCK1234F1Z5",
        pan: "AABCK1234F",
        address: "Floor 4, KaamDo Tower, Outer Ring Road, Bengaluru, Karnataka - 560103",
        supportEmail: "support@kaamdo.com",
        helpline: "+91 1800-123-4567",
      },
      customer: {
        name: (job.customerId as any)?.name || "Valued Customer",
        phone: (job.customerId as any)?.phone || "N/A",
        email: (job.customerId as any)?.email || "N/A",
        serviceAddress: job.address
          ? `${job.address.street}, ${job.address.city}, ${job.address.state || "India"} - ${job.address.postalCode || ""}`
          : "N/A",
      },
      worker: job.workerId
        ? {
            name: (job.workerId as any)?.name || "Verified Professional",
            phone: (job.workerId as any)?.phone || "N/A",
          }
        : null,
      lineItems: [
        {
          description: `Service Charges: ${(job.categoryId as any)?.name || "Professional Service"} (${job.description || "General maintenance"})`,
          sacCode: "9987",
          quantity: 1,
          unitPrice: baseAmount,
          totalPrice: baseAmount,
        },
        ...(job.materials || []).map((m: any) => ({
          description: `Material / Part: ${m.name}`,
          sacCode: "9987",
          quantity: m.quantity || 1,
          unitPrice: m.unitPrice || 0,
          totalPrice: m.totalPrice || (m.quantity * m.unitPrice) || 0,
        })),
        ...approvedAdditionalCharges.map((c: any) => ({
          description: `Additional Charge: ${c.reason}`,
          sacCode: "9987",
          quantity: 1,
          unitPrice: c.amount,
          totalPrice: c.amount,
        })),
      ],
      pricingSummary: {
        subtotal,
        discount,
        taxableAmount,
        cgstRate: "9%",
        cgstAmount,
        sgstRate: "9%",
        sgstAmount,
        totalTax,
        grandTotal,
      },
      payment: {
        status: payment?.status || (job.status === "paid" || job.status === "closed" ? "paid" : "pending"),
        transactionId: payment?.transactionId || (payment as any)?.razorpayPaymentId || "N/A",
        paymentMethod: payment?.paymentMethod || "Online / UPI",
        paidAt: payment?.createdAt || job.endTime,
      },
    };

    const { searchParams } = new URL(request.url);
    if (searchParams.get("format") === "html") {
      // Return printable HTML document
      const html = generatePrintableHtml(invoiceData);
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return successResponse(invoiceData);
  } catch (error) {
    return handleApiError(error);
  }
}

function generatePrintableHtml(inv: any): string {
  const lineItemRows = inv.lineItems
    .map(
      (item: any, i: number) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px; font-size: 13px; color: #4b5563;">${i + 1}</td>
        <td style="padding: 10px 12px; font-size: 13px; font-weight: 500; color: #111827;">${item.description}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #4b5563; text-align: center;">${item.sacCode}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #4b5563; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #4b5563; text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #111827; text-align: right;">₹${item.totalPrice.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${inv.invoiceNumber}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px; color: #1f2937; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0456D3; padding-bottom: 24px; margin-bottom: 24px; }
    .logo { font-size: 28px; font-weight: 900; color: #001E68; letter-spacing: -0.5px; }
    .logo span { color: #FE6705; }
    .tax-badge { display: inline-block; background: #eff6ff; color: #0456D3; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .meta-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 6px; }
    .meta-text { font-size: 13px; line-height: 1.5; color: #374151; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f3f4f6; padding: 10px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #4b5563; text-align: left; }
    .totals-table { width: 320px; margin-left: auto; margin-bottom: 32px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #4b5563; }
    .totals-row.grand { border-top: 2px solid #111827; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 700; color: #111827; }
    .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
    .print-btn { background: #0456D3; color: #ffffff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
    .print-btn:hover { background: #0343A5; }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto 16px auto; display: flex; justify-content: flex-end;" class="no-print">
    <button class="print-btn" onclick="window.print()">Print / Download PDF</button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo">Kaam<span>Do</span></div>
        <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">Har Kaam, Sahi Insaan</div>
        <div class="tax-badge">GST Tax Invoice</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 18px; font-weight: 700; color: #111827;">${inv.invoiceNumber}</div>
        <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Date: ${new Date(inv.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
        <div style="font-size: 12px; color: #6b7280;">Job ID: #${inv.jobNumber}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="meta-title">Issued By (Service Provider)</div>
        <p class="meta-text" style="font-weight: 600; color: #111827;">${inv.company.legalName}</p>
        <p class="meta-text">${inv.company.address}</p>
        <p class="meta-text"><strong>GSTIN:</strong> ${inv.company.gstin}</p>
        <p class="meta-text"><strong>PAN:</strong> ${inv.company.pan}</p>
        <p class="meta-text">Helpline: ${inv.company.helpline}</p>
      </div>
      <div>
        <div class="meta-title">Billed To (Customer)</div>
        <p class="meta-text" style="font-weight: 600; color: #111827;">${inv.customer.name}</p>
        <p class="meta-text">Phone: ${inv.customer.phone}</p>
        <p class="meta-text">Email: ${inv.customer.email}</p>
        <p class="meta-text">Service Address: ${inv.customer.serviceAddress}</p>
        ${inv.worker ? `<p class="meta-text" style="margin-top: 6px; font-size: 12px; color: #6b7280;">Fulfilled by: ${inv.worker.name}</p>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>Description</th>
          <th style="width: 70px; text-align: center;">SAC</th>
          <th style="width: 50px; text-align: center;">Qty</th>
          <th style="width: 100px; text-align: right;">Rate</th>
          <th style="width: 110px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemRows}
      </tbody>
    </table>

    <div class="totals-table">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span style="font-weight: 500;">₹${inv.pricingSummary.subtotal.toFixed(2)}</span>
      </div>
      ${inv.pricingSummary.discount > 0 ? `
      <div class="totals-row" style="color: #059669;">
        <span>Promo Discount:</span>
        <span>-₹${inv.pricingSummary.discount.toFixed(2)}</span>
      </div>` : ""}
      <div class="totals-row">
        <span>Taxable Amount:</span>
        <span style="font-weight: 500;">₹${inv.pricingSummary.taxableAmount.toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>CGST (9%):</span>
        <span>₹${inv.pricingSummary.cgstAmount.toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span>SGST (9%):</span>
        <span>₹${inv.pricingSummary.sgstAmount.toFixed(2)}</span>
      </div>
      <div class="totals-row grand">
        <span>Total Amount:</span>
        <span>₹${inv.pricingSummary.grandTotal.toFixed(2)}</span>
      </div>
      <div style="margin-top: 8px; text-align: right; font-size: 12px; color: #059669; font-weight: 600;">
        Payment Status: ${inv.payment.status.toUpperCase()}
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0;">This is a computer-generated invoice and requires no physical signature.</p>
      <p style="margin: 0;">KaamDo Technologies Pvt Ltd • GSTIN: ${inv.company.gstin} • Support: ${inv.company.supportEmail}</p>
    </div>
  </div>
</body>
</html>`;
}
