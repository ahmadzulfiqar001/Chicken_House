import { siteConfig } from "./site";

export type ReceiptPrintLine = {
  name: string;
  quantity: number;
  price: number;
  variantLabel?: string;
  customizations?: {
    variantLabel?: string;
    drink?: string;
    chutney?: string;
    spices?: string;
    instructions?: string;
    extras?: string[];
  };
};

export type ReceiptPrintOrder = {
  id: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  city?: string;
  type?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentReference?: string;
  time?: string | Date;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  notes?: string;
  items: ReceiptPrintLine[];
};

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

const escapeHtml = (value?: string | number | null) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => htmlEscapes[character]);

const toNumber = (value?: number) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value?: number) => `Rs. ${toNumber(value).toLocaleString("en-PK")}`;

const formatDate = (value?: string | Date) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toLocaleString("en-PK") : date.toLocaleString("en-PK");
};

const renderInfoRow = (label: string, value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  return `
    <div class="info-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
};

const getItemNotes = (item: ReceiptPrintLine) =>
  [
    item.variantLabel,
    item.customizations?.variantLabel,
    item.customizations?.spices,
    item.customizations?.drink,
    item.customizations?.chutney,
    ...(item.customizations?.extras ?? []),
    item.customizations?.instructions ? `Note: ${item.customizations.instructions}` : "",
  ].filter(Boolean);

const renderItems = (items: ReceiptPrintLine[]) =>
  items
    .map((item, index) => {
      const quantity = Math.max(1, Number(item.quantity ?? 1));
      const itemNotes = getItemNotes(item);

      return `
        <div class="item" key="${index}">
          <div>
            <strong>${escapeHtml(quantity)} x ${escapeHtml(item.name || "Order item")}</strong>
            ${
              itemNotes.length
                ? `<p>${itemNotes.map((note) => escapeHtml(note)).join(" | ")}</p>`
                : ""
            }
          </div>
          <span>${escapeHtml(formatCurrency(item.price * quantity))}</span>
        </div>
      `;
    })
    .join("");

const buildReceiptCopy = (order: ReceiptPrintOrder, copyLabel: string) => {
  const subtotal = order.subtotal ?? Math.max(0, order.total - toNumber(order.deliveryFee));
  const deliveryFee = toNumber(order.deliveryFee);
  const locationLabel = order.type === "Takeaway" ? "Pickup" : "Address";
  const location = order.deliveryAddress || (order.type === "Takeaway" ? "Takeaway Pickup" : "");

  return `
    <section class="receipt-copy">
      <header>
        <p class="copy-label">${escapeHtml(copyLabel)}</p>
        <h1>${escapeHtml(siteConfig.brandName)}</h1>
        <p>${escapeHtml(siteConfig.tagline)}</p>
        <p>${escapeHtml(siteConfig.phone)}</p>
        <p>${escapeHtml(siteConfig.addressLine1)}</p>
        <p>${escapeHtml(siteConfig.city)}</p>
      </header>

      <div class="divider"></div>

      ${renderInfoRow("Order ID", order.id)}
      ${renderInfoRow("Date", formatDate(order.time))}
      ${renderInfoRow("Customer", order.customer)}
      ${renderInfoRow("Phone", order.customerPhone)}
      ${renderInfoRow("Email", order.customerEmail)}
      ${renderInfoRow("Order Type", order.type)}
      ${renderInfoRow(locationLabel, location)}
      ${renderInfoRow("City", order.city)}
      ${renderInfoRow("Payment", order.paymentMethod || "Cash on Delivery")}
      ${renderInfoRow("Payment Status", order.paymentStatus)}
      ${renderInfoRow("Reference", order.paymentReference)}

      <div class="divider"></div>

      <div class="items">
        ${renderItems(order.items.length ? order.items : [{ name: "Order item", quantity: 1, price: subtotal }])}
      </div>

      <div class="divider"></div>

      <div class="total-row">
        <span>Subtotal</span>
        <strong>${escapeHtml(formatCurrency(subtotal))}</strong>
      </div>
      <div class="total-row">
        <span>Delivery Fee</span>
        <strong>${order.type === "Takeaway" ? "Free" : escapeHtml(formatCurrency(deliveryFee))}</strong>
      </div>
      <div class="grand-total">
        <span>Total</span>
        <strong>${escapeHtml(formatCurrency(order.total))}</strong>
      </div>

      ${order.notes ? `<div class="notes"><strong>Notes:</strong> ${escapeHtml(order.notes)}</div>` : ""}

      <p class="thanks">Thank you for ordering from ${escapeHtml(siteConfig.brandName)}</p>
      <p class="developer">Developed by Team Titan</p>
    </section>
  `;
};

const buildReceiptDocument = (order: ReceiptPrintOrder) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(order.id)} Receipt</title>
      <style>
        @page {
          margin: 4mm;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #ffffff;
          color: #111111;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
          line-height: 1.35;
        }

        .receipt-copy {
          width: 72mm;
          max-width: 100%;
          margin: 0 auto 8mm;
          padding: 0 0 8mm;
          border-bottom: 1px dashed #777777;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .receipt-copy:last-child {
          margin-bottom: 0;
          border-bottom: 0;
        }

        header {
          text-align: center;
        }

        h1 {
          margin: 3px 0 2px;
          font-size: 19px;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        p {
          margin: 2px 0;
        }

        .copy-label {
          display: inline-block;
          margin-bottom: 4px;
          border: 1px solid #111111;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .divider {
          margin: 8px 0;
          border-top: 1px dashed #777777;
        }

        .info-row,
        .total-row,
        .grand-total,
        .item {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .info-row span,
        .total-row span,
        .grand-total span {
          color: #555555;
        }

        .info-row strong,
        .total-row strong,
        .grand-total strong,
        .item span {
          text-align: right;
          word-break: break-word;
        }

        .items {
          display: grid;
          gap: 6px;
        }

        .item div {
          min-width: 0;
          word-break: break-word;
        }

        .item p {
          color: #555555;
          font-size: 10px;
        }

        .grand-total {
          margin-top: 5px;
          border-top: 1px solid #111111;
          padding-top: 5px;
          font-size: 14px;
          font-weight: 700;
        }

        .notes {
          margin-top: 8px;
          border-top: 1px dashed #777777;
          padding-top: 6px;
          word-break: break-word;
        }

        .thanks {
          margin-top: 10px;
          text-align: center;
          font-weight: 700;
        }

        .developer {
          margin-top: 7px;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          color: #555555;
        }

        @media print {
          body {
            width: 72mm;
          }
        }
      </style>
    </head>
    <body>
      ${buildReceiptCopy(order, "Customer Copy")}
      ${buildReceiptCopy(order, "Chicken House Copy")}
    </body>
  </html>
`;

export const printReceipt = (order: ReceiptPrintOrder) => {
  const printFrame = document.createElement("iframe");
  printFrame.title = `${order.id} receipt`;
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";
  printFrame.style.opacity = "0";

  document.body.appendChild(printFrame);

  const printDocument = printFrame.contentDocument ?? printFrame.contentWindow?.document;

  if (!printDocument || !printFrame.contentWindow) {
    printFrame.remove();
    window.alert("Receipt print window could not be prepared. Please try again.");
    return;
  }

  printDocument.open();
  printDocument.write(buildReceiptDocument(order));
  printDocument.close();

  const runPrint = () => {
    const printWindow = printFrame.contentWindow;
    if (!printWindow) {
      printFrame.remove();
      return;
    }

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      printFrame.remove();
    };

    printWindow.focus();
    printWindow.addEventListener("afterprint", cleanup, { once: true });
    printWindow.print();
    window.setTimeout(cleanup, 60000);
  };

  window.setTimeout(runPrint, 150);
};
