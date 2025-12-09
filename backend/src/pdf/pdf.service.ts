import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generateReport(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      this.generateMaterialInwardPage(doc, data);
      doc.addPage();
      this.generateProformaInvoicePage(doc, data);

      doc.end();
    });
  }

  private generateMaterialInwardPage(doc: any, data: any) {
    const currentDate = data.date ? this.formatDateShort(data.date) : this.formatDateShort(new Date().toISOString());
    const reportDate = data.reportDate ? this.formatDate(data.reportDate) : this.formatDate(new Date().toISOString());
    const jobNo = data.jobNo || '';
    const clientCode = data.clientCode || '';
    const combinedJobNo = clientCode ? `BRD/${clientCode}/${jobNo}` : `BRD/${jobNo}`;
    
    const pageWidth = 595;
    const margin = 50;
    
    doc.fontSize(10).font('Helvetica');
    const dateWidth = doc.widthOfString(currentDate);
    doc.text(currentDate, pageWidth - margin - dateWidth, 30);
    
    doc.fontSize(16).font('Helvetica-Bold');
    const titleWidth = doc.widthOfString('MATERIAL INWARD');
    doc.text('MATERIAL INWARD', (pageWidth - titleWidth) / 2, 50);
    doc.moveTo((pageWidth - titleWidth) / 2, 68).lineTo((pageWidth - titleWidth) / 2 + titleWidth, 68).stroke();
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`Job No: ${combinedJobNo}`, margin, 80);
    const reportDateWidth = doc.widthOfString(`Report by Dt: ${reportDate}`);
    doc.text(`Report by Dt: ${reportDate}`, pageWidth - margin - reportDateWidth, 80);

    doc.moveTo(margin, 110).lineTo(pageWidth - margin, 110).stroke();

    const tableStartX = margin;
    const tableEndX = pageWidth - margin;
    const col1Width = 60;
    const col2Width = 80;
    const col1X = tableStartX;
    const col2X = col1X + col1Width;
    const col3X = col2X + col2Width;
    const headerY = 130;
    const headerRowHeight = 30;

    doc.fontSize(10).font('Helvetica-Bold');
    const headerTextY = headerY + 10;
    doc.text('Sr. No.', col1X + 5, headerTextY);
    doc.text('Sample No', col2X + 5, headerTextY);
    doc.text('Material / Tests', col3X + 5, headerTextY);

    doc.moveTo(tableStartX, headerY).lineTo(tableEndX, headerY).stroke();
    doc.moveTo(col2X, headerY).lineTo(col2X, headerY + headerRowHeight).stroke();
    doc.moveTo(col3X, headerY).lineTo(col3X, headerY + headerRowHeight).stroke();
    doc.moveTo(tableStartX, headerY + headerRowHeight).lineTo(tableEndX, headerY + headerRowHeight).stroke();

    let yPos = headerY + headerRowHeight;
    let srNo = 1;
    let sampleNoCounter = 1;

    if (data.materials && data.materials.length > 0) {
      data.materials.forEach((material: any, materialIndex: number) => {
        const rowStartY = yPos;
        let currentY = rowStartY + 5;
        
        doc.fontSize(10).font('Helvetica');
        const materialText = `${material.material} (Specimen Nos.: ${srNo}) - Report No. - ${data.reportNo || 'N/A'}`;
        doc.text(materialText, col3X + 5, currentY, { width: tableEndX - col3X - 10 });
        currentY += 20;
        
        if (material.tests && material.tests.length > 0) {
          doc.fontSize(9).font('Helvetica');
          material.tests.forEach((test: string) => {
            doc.text(test, col3X + 5, currentY, { width: tableEndX - col3X - 10 });
            currentY += 15;
          });
        }
        
        const rowEndY = currentY + 5;
        const totalRowHeight = rowEndY - rowStartY;
        const centerY = rowStartY + (totalRowHeight / 2);
        
        doc.fontSize(10).font('Helvetica');
        doc.text(`${srNo}`, col1X + 5, centerY - 3);
        
        const sampleNoBase = jobNo ? jobNo : '000';
        const sampleNo = `${sampleNoBase}${String(sampleNoCounter).padStart(3, '0')}`;
        doc.text(sampleNo, col2X + 5, centerY - 3);
        
        doc.moveTo(tableStartX, rowStartY).lineTo(tableEndX, rowStartY).stroke();
        doc.moveTo(col1X, rowStartY).lineTo(col1X, rowEndY).stroke();
        doc.moveTo(col2X, rowStartY).lineTo(col2X, rowEndY).stroke();
        doc.moveTo(col3X, rowStartY).lineTo(col3X, rowEndY).stroke();
        doc.moveTo(tableEndX, rowStartY).lineTo(tableEndX, rowEndY).stroke();
        doc.moveTo(tableStartX, rowEndY).lineTo(tableEndX, rowEndY).stroke();
        
        yPos = rowEndY;
        srNo++;
        sampleNoCounter++;
      });
    }
    
    doc.moveTo(tableStartX, yPos).lineTo(tableEndX, yPos).stroke();

                                const footerY = 470;
    doc.fontSize(10).font('Helvetica');
    
    doc.text('Inward Dt:', margin, footerY);
    doc.text('Testing Dt:', margin + 120, footerY);
    doc.text('Reporting Dt:', margin + 240, footerY);
    doc.text('Dispatch Dt:', margin + 360, footerY);
    
    doc.text(`Job No: BRD/${jobNo}`, margin, footerY + 20);
    
    const pageNumWidth = doc.widthOfString('1 of 1');
    doc.text('1 of 1', pageWidth - margin - pageNumWidth, footerY + 20);
  }

  private generateProformaInvoicePage(doc: any, data: any) {
    const currentDate = data.date ? this.formatDate(data.date) : this.formatDate(new Date().toISOString());
    const reportDate = data.reportDate ? this.formatDate(data.reportDate) : this.formatDate(new Date().toISOString());
    const jobNo = data.jobNo || '';
    const clientCode = data.clientCode || '';
    const combinedJobNo = clientCode ? `${clientCode}/${jobNo}` : jobNo;
    const invoiceNo = jobNo ? `BRD/${jobNo}` : 'BRD/';

    const pageWidth = 595;
    const margin = 50;
    
    doc.fontSize(16).font('Helvetica-Bold');
    const invoiceTitleWidth = doc.widthOfString('PERFORMA INVOICE');
    doc.text('PERFORMA INVOICE', (pageWidth - invoiceTitleWidth) / 2, 50);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`No: ${invoiceNo}`, margin, 50);
    doc.text(`Date: ${currentDate}`, margin, 65);
    
    const jobNoWidth = doc.widthOfString(`Job No.: ${combinedJobNo}`);
    doc.text(`Job No.: ${combinedJobNo}`, pageWidth - margin - jobNoWidth, 50);
    const reportDateWidth = doc.widthOfString(`Report Date: ${reportDate}`);
    doc.text(`Report Date: ${reportDate}`, pageWidth - margin - reportDateWidth, 65);

    const leftX = margin;
    const rightX = 300;
    const sectionStartY = 120;
    let currentY = sectionStartY;
    
    const leftBoxStartX = leftX;
    const leftBoxEndX = rightX - 10;
    const rightBoxStartX = rightX;
    const rightBoxEndX = pageWidth - margin;
    
    let leftBoxEndY = sectionStartY;
    let rightBoxEndY = sectionStartY;
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('To:', leftX + 5, currentY + 5);
    doc.fontSize(10).font('Helvetica');
    currentY += 18;
    leftBoxEndY = currentY;
    
    if (data.clientName) {
      doc.text(data.clientName || '', leftX + 5, currentY);
      currentY += 15;
      leftBoxEndY = currentY;
    }
    
    if (data.address) {
      const addressHeight = doc.heightOfString(data.address || '', { width: leftBoxEndX - leftX - 10 });
      doc.text(data.address || '', leftX + 5, currentY, { width: leftBoxEndX - leftX - 10 });
      currentY += Math.max(addressHeight, 15);
      leftBoxEndY = currentY;
    }
    
    if (data.gstNo) {
      doc.text(`GST No.: ${data.gstNo || ''}`, leftX + 5, currentY);
      currentY += 15;
      leftBoxEndY = currentY;
    }
    
    if (data.city) {
      doc.text(`City: ${data.city || ''}`, leftX + 5, currentY);
      currentY += 15;
      leftBoxEndY = currentY;
    }
    
    leftBoxEndY = currentY + 5;

    currentY = sectionStartY;
    doc.fontSize(10).font('Helvetica');
    if (data.contactName) {
      doc.text(`Contact name: ${data.contactName}`, rightX + 5, currentY + 5);
      currentY += 15;
      rightBoxEndY = currentY;
    }
    if (data.contactNo) {
      doc.text(`Contact No.: ${data.contactNo}`, rightX + 5, currentY + 5);
      currentY += 15;
      rightBoxEndY = currentY;
    }
    if (data.client) {
      doc.text(`Client: ${data.client || ''}`, rightX + 5, currentY + 5);
      currentY += 15;
      rightBoxEndY = currentY;
    }
    
    const refNoText = `Ref. No. & Date: ${data.refNo || ''} Dtd: ${currentDate}`;
    const refNoHeight = doc.heightOfString(refNoText, { width: rightBoxEndX - rightX - 10 });
    doc.text(refNoText, rightX + 5, currentY + 5, { width: rightBoxEndX - rightX - 10 });
    rightBoxEndY = currentY + Math.max(refNoHeight, 15) + 5;
    
    const maxBoxHeight = Math.max(leftBoxEndY - sectionStartY, rightBoxEndY - sectionStartY);
    const boxEndY = sectionStartY + maxBoxHeight;
    
    doc.moveTo(leftBoxStartX, sectionStartY).lineTo(leftBoxEndX, sectionStartY).stroke();
    doc.moveTo(leftBoxStartX, sectionStartY).lineTo(leftBoxStartX, boxEndY).stroke();
    doc.moveTo(leftBoxEndX, sectionStartY).lineTo(leftBoxEndX, boxEndY).stroke();
    doc.moveTo(leftBoxStartX, boxEndY).lineTo(leftBoxEndX, boxEndY).stroke();
    
    doc.moveTo(rightBoxStartX, sectionStartY).lineTo(rightBoxEndX, sectionStartY).stroke();
    doc.moveTo(rightBoxStartX, sectionStartY).lineTo(rightBoxStartX, boxEndY).stroke();
    doc.moveTo(rightBoxEndX, sectionStartY).lineTo(rightBoxEndX, boxEndY).stroke();
    doc.moveTo(rightBoxStartX, boxEndY).lineTo(rightBoxEndX, boxEndY).stroke();

    const nameOfWorkY = boxEndY + 20;
    const nameOfWorkStartY = nameOfWorkY;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Name of Work:', margin + 5, nameOfWorkY + 5);
    doc.fontSize(10).font('Helvetica');
    const nameOfWorkLines = doc.heightOfString(data.nameOfWork || '', { width: 500 });
    doc.text(data.nameOfWork || '', margin + 5, nameOfWorkY + 25, { width: 500 });
    const nameOfWorkEndY = nameOfWorkY + 25 + nameOfWorkLines + 10;
    
    doc.moveTo(margin, nameOfWorkStartY).lineTo(pageWidth - margin, nameOfWorkStartY).stroke();
    doc.moveTo(margin, nameOfWorkStartY).lineTo(margin, nameOfWorkEndY).stroke();
    doc.moveTo(pageWidth - margin, nameOfWorkStartY).lineTo(pageWidth - margin, nameOfWorkEndY).stroke();
    doc.moveTo(margin, nameOfWorkEndY).lineTo(pageWidth - margin, nameOfWorkEndY).stroke();

    const tableStartX = margin;
    const tableEndX = pageWidth - margin;
    const col1X = tableStartX;
    const col2X = 70;
    const col3X = 170;
    const col4X = 270;
    const col5X = 310;
    const col6X = 375;
    const col7X = 455;
    const headerY = nameOfWorkEndY + 20;
    const headerRowHeight = 20;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Sr.No.', col1X + 5, headerY + 10, { width: col2X - col1X - 10 });
    doc.text('Material', col2X + 5, headerY + 10, { width: col3X - col2X - 10 });
    doc.text('Test', col3X + 5, headerY + 10, { width: col4X - col3X - 10 });
    doc.text('Qty', col4X + 5, headerY + 10, { width: col5X - col4X - 10 });
    doc.text('Rate', col5X + 5, headerY + 10, { width: col6X - col5X - 10 });
    doc.text('Rate(inc. ST)', col6X + 5, headerY + 10, { width: col7X - col6X - 10 });
    doc.text('Amount(Rs)', col7X + 5, headerY + 10, { width: tableEndX - col7X - 10 });

    doc.moveTo(tableStartX, headerY).lineTo(tableEndX, headerY).stroke();
    doc.moveTo(col1X, headerY).lineTo(col1X, headerY + headerRowHeight).stroke();
    doc.moveTo(col2X, headerY).lineTo(col2X, headerY + headerRowHeight).stroke();
    doc.moveTo(col3X, headerY).lineTo(col3X, headerY + headerRowHeight).stroke();
    doc.moveTo(col4X, headerY).lineTo(col4X, headerY + headerRowHeight).stroke();
    doc.moveTo(col5X, headerY).lineTo(col5X, headerY + headerRowHeight).stroke();
    doc.moveTo(col6X, headerY).lineTo(col6X, headerY + headerRowHeight).stroke();
    doc.moveTo(col7X, headerY).lineTo(col7X, headerY + headerRowHeight).stroke();
    doc.moveTo(tableEndX, headerY).lineTo(tableEndX, headerY + headerRowHeight).stroke();
    doc.moveTo(tableStartX, headerY + headerRowHeight).lineTo(tableEndX, headerY + headerRowHeight).stroke();

    let yPos = headerY + headerRowHeight;
    let srNo = 1;
    let subTotal = 0;

    if (data.materials && data.materials.length > 0) {
      data.materials.forEach((material: any) => {
        const materialStartY = yPos;
        let materialEndY = yPos;
        
        if (material.tests && material.tests.length > 0) {
          const numTests = material.tests.length;
          materialEndY = materialStartY + (numTests * 20);
          
          material.tests.forEach((test: string, testIndex: number) => {
            doc.fontSize(9).font('Helvetica');
            doc.text(test || '', col3X + 5, yPos + 5, { width: col4X - col3X - 10 });
            const qty = material.quantities?.[testIndex] ?? 1;
            const rate = material.rates?.[testIndex] ?? 0;
            const rateWithST = material.ratesWithST?.[testIndex] ?? 0;
            doc.text(`${qty}`, col4X + 5, yPos + 5, { width: col5X - col4X - 10, align: 'left' });
            doc.text(`${rate.toFixed(2)}`, col5X + 5, yPos + 5, { width: col6X - col5X - 10, align: 'left' });
            doc.text(`${rateWithST.toFixed(2)}`, col6X + 5, yPos + 5, { width: col7X - col6X - 10, align: 'left' });
            
            const amount = rate * qty;
            doc.text(`${amount.toFixed(2)}`, col7X + 5, yPos + 5, { width: tableEndX - col7X - 10, align: 'left' });
            subTotal += amount;
            
            yPos += 20;
          });
          
          const materialCenterY = materialStartY + ((materialEndY - materialStartY) / 2);
          const srNoCenterY = materialCenterY;
          
          doc.fontSize(9).font('Helvetica');
          doc.text(`${srNo}`, col1X + 5, srNoCenterY - 3, { width: col2X - col1X - 10 });
          doc.text(material.material || '', col2X + 5, materialCenterY - 3, { width: col3X - col2X - 10 });
          
          material.tests.forEach((test: string, testIndex: number) => {
            const rowStartY = materialStartY + (testIndex * 20);
            const rowEndY = rowStartY + 20;
            
            if (testIndex === 0) {
              doc.moveTo(tableStartX, rowStartY).lineTo(tableEndX, rowStartY).stroke();
            } else {
              doc.moveTo(col3X, rowStartY).lineTo(tableEndX, rowStartY).stroke();
            }
            
            doc.moveTo(col3X, rowStartY).lineTo(col3X, rowEndY).stroke();
            doc.moveTo(col4X, rowStartY).lineTo(col4X, rowEndY).stroke();
            doc.moveTo(col5X, rowStartY).lineTo(col5X, rowEndY).stroke();
            doc.moveTo(col6X, rowStartY).lineTo(col6X, rowEndY).stroke();
            doc.moveTo(col7X, rowStartY).lineTo(col7X, rowEndY).stroke();
            doc.moveTo(tableEndX, rowStartY).lineTo(tableEndX, rowEndY).stroke();
            
            if (testIndex === material.tests.length - 1) {
              doc.moveTo(tableStartX, rowEndY).lineTo(tableEndX, rowEndY).stroke();
            } else {
              doc.moveTo(col3X, rowEndY).lineTo(tableEndX, rowEndY).stroke();
            }
          });
          
          doc.moveTo(tableStartX, materialStartY).lineTo(tableStartX, materialEndY).stroke();
          doc.moveTo(col2X, materialStartY).lineTo(col2X, materialEndY).stroke();
        } else {
          const rowStartY = yPos;
          const rowEndY = yPos + 20;
          
          doc.fontSize(9).font('Helvetica');
          doc.text(`${srNo}`, col1X + 5, yPos + 5, { width: col2X - col1X - 10 });
          doc.text(material.material || '', col2X + 5, yPos + 5, { width: col3X - col2X - 10 });
          doc.text('', col3X + 5, yPos + 5, { width: col4X - col3X - 10 });
          doc.text(`${material.qty || 1}`, col4X + 5, yPos + 5, { width: col5X - col4X - 10, align: 'left' });
          doc.text(`${(material.rate || 0).toFixed(2)}`, col5X + 5, yPos + 5, { width: col6X - col5X - 10, align: 'left' });
          doc.text(`${(material.rateWithST || 0).toFixed(2)}`, col6X + 5, yPos + 5, { width: col7X - col6X - 10, align: 'left' });
          const amount = (material.rate || 0) * (material.qty || 1);
          doc.text(`${amount.toFixed(2)}`, col7X + 5, yPos + 5, { width: tableEndX - col7X - 10, align: 'left' });
          subTotal += amount;
          
          doc.moveTo(tableStartX, rowStartY).lineTo(tableEndX, rowStartY).stroke();
          doc.moveTo(tableStartX, rowStartY).lineTo(tableStartX, rowEndY).stroke();
          doc.moveTo(col1X, rowStartY).lineTo(col1X, rowEndY).stroke();
          doc.moveTo(col2X, rowStartY).lineTo(col2X, rowEndY).stroke();
          doc.moveTo(col3X, rowStartY).lineTo(col3X, rowEndY).stroke();
          doc.moveTo(col4X, rowStartY).lineTo(col4X, rowEndY).stroke();
          doc.moveTo(col5X, rowStartY).lineTo(col5X, rowEndY).stroke();
          doc.moveTo(col6X, rowStartY).lineTo(col6X, rowEndY).stroke();
          doc.moveTo(col7X, rowStartY).lineTo(col7X, rowEndY).stroke();
          doc.moveTo(tableEndX, rowStartY).lineTo(tableEndX, rowEndY).stroke();
          doc.moveTo(tableStartX, rowEndY).lineTo(tableEndX, rowEndY).stroke();
          
          yPos += 20;
        }
        
        srNo++;
      });
    }
    
    doc.moveTo(tableStartX, yPos).lineTo(tableEndX, yPos).stroke();

    const discount = Number(data.discount) || 0;
    const discountAmount = (subTotal * discount) / 100;
    const afterDiscount = subTotal - discountAmount;
    const sgst = Number(data.sgst) || 0;
    const cgst = Number(data.cgst) || 0;
    const sgstAmount = (afterDiscount * sgst) / 100;
    const cgstAmount = (afterDiscount * cgst) / 100;
    const total = Math.max(0, afterDiscount + sgstAmount + cgstAmount);

    const summaryStartY = yPos + 20;
    const summaryRightX = pageWidth - margin;
    const summaryLeftX = summaryRightX - 180;

    doc.fontSize(10).font('Helvetica');
    const subTotalText = `Sub Total:`;
    const subTotalValue = `${subTotal.toFixed(2)}`;
    doc.text(subTotalText, summaryLeftX, summaryStartY);
    doc.text(subTotalValue, summaryRightX - doc.widthOfString(subTotalValue), summaryStartY);
    
    const discountText = `${discount}% Discount:`;
    const discountValue = `${discountAmount.toFixed(2)}`;
    doc.text(discountText, summaryLeftX, summaryStartY + 20);
    doc.text(discountValue, summaryRightX - doc.widthOfString(discountValue), summaryStartY + 20);
    
    const sgstText = `${sgst}% SGST:`;
    const sgstValue = `${sgstAmount.toFixed(2)}`;
    doc.text(sgstText, summaryLeftX, summaryStartY + 40);
    doc.text(sgstValue, summaryRightX - doc.widthOfString(sgstValue), summaryStartY + 40);
    
    const cgstText = `${cgst}% CGST:`;
    const cgstValue = `${cgstAmount.toFixed(2)}`;
    doc.text(cgstText, summaryLeftX, summaryStartY + 60);
    doc.text(cgstValue, summaryRightX - doc.widthOfString(cgstValue), summaryStartY + 60);
    
    doc.fontSize(12).font('Helvetica-Bold');
    const totalText = `Total Rs:`;
    const totalValue = `${total.toFixed(0)}`;
    doc.text(totalText, summaryLeftX, summaryStartY + 85);
    doc.text(totalValue, summaryRightX - doc.widthOfString(totalValue), summaryStartY + 85);

    const wordsY = summaryStartY;
    doc.fontSize(10).font('Helvetica');
    const wordsText = `In Words: RUPEES ${this.numberToWords(total)}`;
    doc.text(wordsText, margin, wordsY, { width: summaryLeftX - margin - 30 });

    const footerY = 750;
    doc.fontSize(8).font('Helvetica');
    doc.text('PAN NO.: AADCG0367L', margin, footerY);
    doc.text('GST NO.: 24AADCG0367L1ZM', margin, footerY + 15);
    doc.text('SERVICE TAX REG. NO.: AADCG0367LST001', margin, footerY + 30);
    doc.text('Category of Services:', margin, footerY + 45);
    doc.text('Technical Testing, Inspection & Certification, Survey and map Making', margin, footerY + 60);

    const companyRightX = pageWidth - margin;
    doc.fontSize(10).font('Helvetica-Bold');
    const companyName = 'GEO DESIGNS & RESEARCH PVT LTD';
    const companyNameWidth = doc.widthOfString(companyName);
    doc.text(companyName, companyRightX - companyNameWidth, footerY);
    doc.fontSize(10).font('Helvetica');
    const signatoryText = 'Authorised Signatory';
    const signatoryWidth = doc.widthOfString(signatoryText);
    doc.text(signatoryText, companyRightX - signatoryWidth, footerY + 20);

    doc.fontSize(8).font('Helvetica');
    doc.text(invoiceNo, 50, 820);
    const pageNumWidth = doc.widthOfString('1 of 1');
    doc.text('1 of 1', pageWidth - 50 - pageNumWidth, 820);
  }

  private numberToWords(num: number): string {
    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];

    if (num === 0 || isNaN(num)) return 'ZERO ONLY';
    
    let result = '';
    const wholePart = Math.floor(Math.abs(num));
    
    if (wholePart >= 1000) {
      const thousands = Math.floor(wholePart / 1000);
      result += this.convertHundreds(thousands, ones, tens, teens) + ' THOUSAND ';
    }
    
    const remainder = wholePart % 1000;
    if (remainder > 0) {
      result += this.convertHundreds(remainder, ones, tens, teens);
    }
    
    const trimmed = result.trim();
    return trimmed || 'ZERO';
  }

  private convertHundreds(num: number, ones: string[], tens: string[], teens: string[]): string {
    let result = '';
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' HUNDRED ';
      num %= 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      return result;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result;
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  }

  private formatDateShort(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  }
}

