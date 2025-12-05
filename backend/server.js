import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import nodemailer from "nodemailer";

import { Rfp, Vendor, Proposal, initDB } from "./database.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --------------------
// INIT DB
// --------------------
await initDB();

// --------------------
// INIT GROQ
// --------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// --------------------
// INIT EMAIL
// --------------------
let transporter;

(async () => {
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("📧 Ethereal email ready");
})();

// ------------------------------------------------
// Utility — Safe JSON parse
// ------------------------------------------------
function safeJson(aiText) {
  let clean = aiText.replace(/```json|```/gi, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
}


// --------------------
// HEALTH
// --------------------
app.get("/", (req, res) => {
  res.json({ status: "Backend running ✅" });
});


// --------------------
// CREATE RFP
// --------------------
app.post("/api/rfp/create", async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
Convert to STRICT JSON ONLY:

{
  "title":"",
  "items":[{"name":"","quantity":0,"specs":""}],
  "total_budget":"",
  "delivery_days":0,
  "payment_terms":"",
  "warranty":""
}
`
        },
        { role: "user", content: req.body.description }
      ],
    });

    const parsed = safeJson(completion.choices[0].message.content);

    const saved = await Rfp.create({
      title: parsed.title,
      items: JSON.stringify(parsed.items),
      total_budget: parsed.total_budget,
      delivery_days: parsed.delivery_days,
      payment_terms: parsed.payment_terms,
      warranty: parsed.warranty,
    });

    res.json({ success:true, rfp:saved });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:"RFP creation failed" });
  }
});


// --------------------
// VENDORS
// --------------------
app.post("/api/vendors", async (req, res) => {
  const vendor = await Vendor.create(req.body);
  res.json({ success:true, vendor });
});

app.get("/api/vendors", async (req, res) => {
  const vendors = await Vendor.findAll();
  res.json({ success:true, vendors });
});


// --------------------
// EMAIL SEND
// --------------------
app.post("/api/rfp/send", async (req, res) => {
  try {
    const { rfpId, vendorIds } = req.body;

    const rfp = await Rfp.findByPk(rfpId);
    const vendors = await Vendor.findAll({
      where: { id: vendorIds },
    });

    const previews = [];

    for (const vendor of vendors) {
      const info = await transporter.sendMail({
        from: '"Procurement AI" <rfp@demo.com>',
        to: vendor.email,
        subject: `RFP: ${rfp.title}`,
        text: `
${rfp.items}

Budget: ${rfp.total_budget}
Delivery: ${rfp.delivery_days}
Payment: ${rfp.payment_terms}
Warranty: ${rfp.warranty}
`
      });

      previews.push(nodemailer.getTestMessageUrl(info));
    }

    res.json({ success:true, previews });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:"Email failed" });
  }
});


// --------------------
// PARSE PROPOSAL
// --------------------
app.post("/api/proposals/parse", async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
Extract proposal as STRICT JSON:

{
  "total_price":"",
  "delivery_days":0,
  "payment_terms":"",
  "warranty":""
}
`
        },
        {
          role: "user",
          content: req.body.emailText
        }
      ]
    });

    const parsed = safeJson(completion.choices[0].message.content);

    const saved = await Proposal.create({
      rfpId: req.body.rfpId,
      vendorId: req.body.vendorId,
      total_price: parsed.total_price,
      delivery_days: parsed.delivery_days,
      payment_terms: parsed.payment_terms,
      warranty: parsed.warranty,
      raw_text: req.body.emailText
    });

    res.json({ success:true, proposal:saved });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:"Proposal parse failed" });
  }
});


// --------------------
// COMPARE & RECOMMEND
// --------------------
app.get("/api/compare/:rfpId", async (req, res) => {
  try {
    const proposals = await Proposal.findAll({
      where: { rfpId: req.params.rfpId }
    });

    if (!proposals.length) {
      return res.status(400).json({
        success:false,
        error:"No proposals to compare"
      });
    }

    const prompt = `
Given the proposals below, recommend the best vendor and explain why.

PROPOSALS:
${JSON.stringify(proposals, null, 2)}

Respond in STRICT JSON:

{
  "recommended_vendor_id": 0,
  "reason": ""
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role:"user", content: prompt }
      ]
    });

    const result = safeJson(completion.choices[0].message.content);

    res.json({
      success:true,
      recommendation: result
    });

  } catch (err) {
    console.error("Compare error:", err);
    res.status(500).json({ success:false, error:"Comparison failed" });
  }
});


// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
