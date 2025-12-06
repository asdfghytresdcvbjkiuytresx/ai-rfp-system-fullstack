
# AI-Powered RFP Management System

This project is a single-user web application that demonstrates how AI can automate the end-to-end procurement workflow for Requests for Proposal (RFPs).

The system allows a procurement manager to:

* Describe purchasing needs in natural language
* Convert that description into a structured RFP using AI
* Manage vendors
* Send RFPs via email
* Receive and parse vendor proposals automatically using AI
* Compare proposals and receive AI-assisted recommendations

The application uses a modern full-stack architecture with a React frontend, a Node.js backend, a database for persistence, SMTP email delivery, and Groq LLM integration.



## Features

### 1. AI-Driven RFP Creation

* User enters free-form procurement requirements.
* AI extracts key fields (items, quantities, price limits, delivery terms, warranty, etc.).
* Structured RFP JSON is generated and stored in the database.

### 2. Vendor Management

* Manage vendor master data.
* Add vendor names and email addresses via the UI.
* Store vendors permanently in the database.

### 3. Email Sending

* Send RFPs to selected vendors through SMTP.
* Uses Nodemailer + Ethereal to send real emails.
* Each send returns a preview link so emails can be viewed live for demo purposes.

### 4. Vendor Proposal Parsing (AI)

* Paste vendor email replies directly into the app.
* AI extracts important terms:

  * Total price
  * Delivery days
  * Payment terms
  * Warranty
* Structured proposal data is persisted to the database automatically.

### 5. AI Proposal Comparison & Recommendation

* Compare all proposals for a given RFP.
* AI evaluates pricing, timelines, warranty, and completeness.
* Returns:

  * Recommended vendor ID
  * Natural-language reasoning for the selection

### 6. Web User Interface

* Fully interactive browser-based UI built in React.
* No Postman needed for demonstration – entire workflow is done visually.



##  Tech Stack

### Frontend

* React (Vite)
* JavaScript
* Minimal CSS

### Backend

* Node.js
* Express.js

### Database

* SQLite
* Sequelize ORM

### Email

* Nodemailer
* Ethereal SMTP

### AI / LLM

* GroqCloud API
* Model: `llama-3.1-8b-instant`



## Repository Structure

/
├── frontend      → React web UI
│
├── backend       → Express API
│   ├── server.js (API + Groq + Email logic)
│   ├── database.js (Sequelize models)
│   └── .env.example
│
└── README.md


## Setup Instructions

### Prerequisites

* Node.js v18+
* Git
* Free Groq API Key:

  * [https://console.groq.com/](https://console.groq.com/)



###  Environment Variables

Create this file:

backend/.env


And add your API key:


PORT=5000
GROQ_API_KEY=YOUR_GROQ_KEY_HERE


>  Do not commit your `.env` file.
> `.env.example` is provided and committed safely.


###  Dependency Installation

From the project root:

bash
cd backend
npm install

cd ../frontend
npm install


###  Run Locally

#### Start Backend

bash
cd backend
npm run dev


Backend runs at:


http://localhost:5000


#### Start Frontend

bash
cd frontend
npm run dev


Open the UI at:


http://localhost:5173

##  Demo Workflow

The following steps are demonstrated entirely using the web UI:



### 1 Create RFP (AI)

Example input:


We need 20 laptops with 16GB RAM and 15 monitors 27 inch.
Budget $50,000. Delivery within 30 days.
Payment Net 30. Warranty 1 year minimum.


 AI converts into structured RFP JSON
 Data stored in DB



### 2 Add Vendors

Enter:

* Vendor name
* Vendor email

 Vendors saved and listed



### 3 Send RFP Emails

* Enter RFP ID
* Select vendor IDs

 RFP emails sent via SMTP
 Preview URLs generated to display real email content


### 4 Parse Vendor Proposals (AI)

Paste messy email replies from vendors:


We can supply the equipment for $47,500 delivered in 25 days.
Payment terms Net 30 and warranty of 2 years included.


 AI extracts structured values
 Proposal stored in database



### 5️ Compare Proposals

Enter RFP ID → Click **Compare**

 AI outputs:

* Best vendor ID
* Reasoning summary



##  API Reference

### Create RFP


POST /api/rfp/create
Body:
{
  "description": "free text procurement request"
}


### Add Vendor


POST /api/vendors
Body:
{
  "name": "Vendor name",
  "email": "vendor@email.com"
}

### Send RFP


POST /api/rfp/send
Body:
{
  "rfpId": 1,
  "vendorIds": [1, 2]
}


### Parse Proposal


POST /api/proposals/parse
Body:
{
  "rfpId": 1,
  "vendorId": 1,
  "emailText": "unstructured vendor reply"
}


### Compare Proposals


GET /api/compare/:rfpId

##  AI Usage

### Models

* GroqCloud LLM — `llama-3.1-8b-instant`

### Functions handled by AI:

* Converting RFP text to structured JSON
* Parsing vendor proposal responses
* Comparing proposals and selecting best vendor



##  Design Decisions

### Database — SQLite

* Lightweight and zero-config
* Sufficient for single-user MVP
* No external DB required



### Email — Ethereal

* Real SMTP service
* Preview URLs allow verification of outgoing mail without sending to real inboxes



### UI — React SPA

* Simple & direct UX for demonstrations
* Avoids Postman or CLI demos
* All workflows performed through browser



##  Assumptions

* Vendor replies are available as readable email text.
* PDF or document attachments are out of project scope.
* Single-user demo environment.
* Proposal evaluation uses simple, explainable logic, enhanced by AI reasoning.



### Tools Used During Development

* ChatGPT
* Youtube






