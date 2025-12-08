# Report Generator Project

A full-stack application for generating Material Inward and Proforma Invoice reports with Next.js frontend and NestJS backend.

## Project Structure

```
report_genrated_project/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend application
└── package.json       # Root package.json for workspace management
```

## Features

- Dynamic form with multiple rows
- Multiple materials per row with tests, quantities, and rates
- Row-wise PDF generation with confirmation alert
- Bulk PDF generation for all rows
- Two-page PDF output:
  - Page 1: Material Inward Report
  - Page 2: Proforma Invoice

## Installation

1. Install dependencies for all workspaces:
```bash
npm run install:all
```

Or install individually:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

## Running the Application

### Development Mode

Start both frontend and backend in separate terminals:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# or
cd backend && npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

- Frontend will run on: http://localhost:3000
- Backend will run on: http://localhost:3001

## Usage

1. Fill in the form fields for each row:
   - Client Code, Job No, Date, Report Date
   - Client Name, Address, GST No, City
   - Contact Name, Contact No
   - Name of Work
   - Add materials with tests, quantities, and rates
   - Set Discount, SGST, and CGST percentages

2. Generate PDF for a single row:
   - Click "Generate PDF for This Row" button
   - Confirm in the alert dialog
   - PDF will be downloaded automatically

3. Generate PDFs for all rows:
   - Click "Generate PDF for All Rows" button
   - PDFs will be generated and downloaded sequentially

## Field Mapping

- **NO**: Combined from Client Code and Job No
- **Job No**: From Job No field
- **Date**: From Date field (or today's date if empty)
- **Report Date**: From Report Date field (or today's date if empty)
- **TO**: Combined from Client Name, Address, GST No, and City
- **Contact Name**: From Contact Name field
- **Contact No**: From Contact No field
- **Name of Work**: From Name of Work field
- **Materials**: Dynamic list with tests, quantities, and rates
- **Discount, SGST, CGST**: Per row values

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript, Axios
- **Backend**: NestJS, TypeScript, PDFKit
- **PDF Generation**: PDFKit

## API Endpoints

- `POST /pdf/generate` - Generate PDF report
  - Request Body: Form data object
  - Response: PDF file (application/pdf)

