import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";
import puppeteer from "@cloudflare/puppeteer";

type Params = {
  tripId: number;
  qrCodeDataUrl: string;
  tripDetails: {
    from: string;
    to: string;
    departureDate: string;
    returnDate: string;
    fare: number;
    ageCategory: string;
  };
  timestamp: number;
};

export class ProcessOrder extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { tripId, qrCodeDataUrl, tripDetails, timestamp } = event.payload;

    // Step 1: Generate PDF invoice using Browser Rendering
    const pdfData = await step.do(
      "generate invoice PDF",
      { retries: { limit: 2, delay: "5 seconds", backoff: "linear" } },
      async () => {
        const browser = await puppeteer.launch(this.env.BROWSER);
        const page = await browser.newPage();

        // Generate HTML for invoice
        const html = this.generateInvoiceHTML(tripId, tripDetails, qrCodeDataUrl, timestamp);
        
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // Wait for QR code image to load
        await page.waitForSelector('.qr-code img', { timeout: 50000 });
        await page.evaluate(() => {
          return new Promise((resolve) => {
            const img = document.querySelector('.qr-code img') as HTMLImageElement;
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            }
          });
        });
        
        // Generate PDF
        const pdf = await page.pdf({
          printBackground: true,
          format: "A4",
          margin: {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px"
          }
        });

        await browser.close();
        
        return pdf;
      }
    );

    // Step 2: Upload PDF to R2
    const uploadResult = await step.do(
      "upload PDF to R2",
      { retries: { limit: 3, delay: "5 seconds", backoff: "linear" } },
      async () => {
        const filename = `ticket-${timestamp}.pdf`;
        
        await this.env.R2_BUCKET.put(filename, pdfData, {
          httpMetadata: {
            contentType: "application/pdf"
          }
        });
        
        const pdfUrl = `https://${this.env.R2_CUSTOM_DOMAIN}/${filename}`;
        
        return {
          filename,
          url: pdfUrl,
          size: pdfData.byteLength
        };
      }
    );

    // Step 3: Notify webhook
    const webhookResult = await step.do(
      "notify webhook",
      { retries: { limit: 3, delay: "5 seconds", backoff: "linear" } },
      async () => {
        const response = await fetch(this.env.WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tripId,
            pdfUrl: uploadResult.url,
            filename: uploadResult.filename,
            timestamp,
            tripDetails
          })
        });
        
        return {
          status: response.status,
          success: response.ok
        };
      }
    );

    return {
      success: true,
      tripId,
      pdfUrl: uploadResult.url,
      filename: uploadResult.filename,
      webhookNotified: webhookResult.success
    };
  }

  private generateInvoiceHTML(
    tripId: number,
    tripDetails: Params["tripDetails"],
    qrCodeDataUrl: string,
    timestamp: number
  ): string {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      padding: 20px;
      color: #1a1a1a;
      background-color: #ffc107;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
    }
    h1 {
      font-size: 36px;
      font-weight: 900;
      font-style: italic;
      margin-bottom: 10px;
      color: #1a1a1a;
      letter-spacing: -0.02em;
    }
    .info-section {
      margin-bottom: 10px;
      background: white;
      padding: 12px 15px;
      border-radius: 8px;
    }
    .info-section p {
      margin: 8px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
    }
    .info-section a {
      color: #1a1a1a;
      text-decoration: none;
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 10px 0 8px 0;
      color: #1a1a1a;
    }
    .trip-details {
      background: white;
      padding: 12px 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      border: 2px solid #1a1a1a;
    }
    .trip-details p {
      margin: 8px 0;
      font-size: 14px;
      color: #1a1a1a;
      font-weight: 500;
    }
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 10px 0;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    .pricing-table th {
      text-align: left;
      padding: 10px 15px;
      background: #1a1a1a;
      color: #ffc107;
      font-weight: 700;
      font-size: 14px;
    }
    .pricing-table td {
      padding: 10px 15px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
      color: #1a1a1a;
    }
    .pricing-table th:last-child,
    .pricing-table td:last-child {
      text-align: right;
    }
    .total-row {
      font-weight: 700;
      font-size: 18px;
      background: #1a1a1a;
      color: #ffc107;
      border-bottom: none;
    }
    .qr-section {
      text-align: center;
      margin-top: 10px;
      padding: 15px;
      background: white;
      border-radius: 8px;
    }
    .qr-section h2 {
      margin-bottom: 10px;
      color: #1a1a1a;
    }
    .qr-code {
      display: inline-block;
      padding: 15px;
      background: #1a1a1a;
      border-radius: 8px;
    }
    .qr-code img {
      width: 200px;
      height: 200px;
      border: 6px solid #ffc107;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  </style>
</head>
<body>
  <div class="content-wrapper">
    <div>
      <h1>INVOICE</h1>
      
      <div class="info-section">
        <p><strong>ID tempahan:</strong> ${tripId}${String(timestamp).slice(-6)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Tarikh tempahan:</strong> ${formatDate(new Date().toISOString())} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Nama:</strong> Jane Doe &nbsp;&nbsp;</p>
      </div>
      
      <h2>Butiran Perjalanan</h2>
      <div class="trip-details">
        <p><strong>${tripDetails.from} ke ${tripDetails.to}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; ${formatDate(tripDetails.departureDate)}, ${formatTime(tripDetails.departureDate)} - ${formatDate(tripDetails.returnDate)}, ${formatTime(tripDetails.returnDate)}</p>
      </div>
      
      <h2>Butiran Tempahan</h2>
      <table class="pricing-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Harga</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Harga tiket</td>
            <td>Rp ${tripDetails.fare.toFixed(0)}</td>
          </tr>
          <tr>
            <td>Bayaran tempahan</td>
            <td>Rp ${Math.round(tripDetails.fare * 0.08)}</td>
          </tr>
          <tr class="total-row">
            <td>Jumlah:</td>
            <td>Rp ${Math.round(tripDetails.fare * 1.08)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="qr-section">
      <h2>Boarding Pass QR</h2>
      <div class="qr-code">
        <img src="${qrCodeDataUrl}" alt="QR Code" />
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}