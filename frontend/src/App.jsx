import { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function App() {

  const [rfpText, setRfpText] = useState("");
  const [rfpResult, setRfpResult] = useState(null);

  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendors, setVendors] = useState([]);

  const [rfpId, setRfpId] = useState("");
  const [vendorIds, setVendorIds] = useState("");
  const [emailResult, setEmailResult] = useState(null);

  const [replyText, setReplyText] = useState("");
  const [replyVendorId, setReplyVendorId] = useState("");
  const [proposalResult, setProposalResult] = useState(null);

  const [compareId, setCompareId] = useState("");
  const [compareResult, setCompareResult] = useState(null);

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    try {
      const res = await fetch(API + "/api/vendors");
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function createRfp() {
    const res = await fetch(API + "/api/rfp/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: rfpText }),
    });
    setRfpResult(await res.json());
  }

  async function addVendor() {
    await fetch(API + "/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: vendorName, email: vendorEmail }),
    });

    setVendorName("");
    setVendorEmail("");
    loadVendors();
  }

  async function sendRfp() {
    const ids = vendorIds.split(",").map(Number);

    const res = await fetch(API + "/api/rfp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rfpId: Number(rfpId),
        vendorIds: ids,
      }),
    });

    setEmailResult(await res.json());
  }

  async function parseReply() {
    const res = await fetch(API + "/api/proposals/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rfpId: Number(rfpId),
        vendorId: Number(replyVendorId),
        emailText: replyText,
      }),
    });

    setProposalResult(await res.json());
  }

  async function compare() {
    const res = await fetch(API + "/api/compare/" + compareId);
    setCompareResult(await res.json());
  }

  return (
    <div style={{ padding: "30px", fontFamily: "Arial", color: "white" }}>

      <h1>AI-Powered RFP Management System</h1>

      <section>
        <h2>Create RFP</h2>
        <textarea
          value={rfpText}
          onChange={e => setRfpText(e.target.value)}
          style={{ width: "100%", height: "80px" }}
        />
        <br/>
        <button onClick={createRfp}>Create</button>
        <pre>{JSON.stringify(rfpResult, null, 2)}</pre>
      </section>

      <hr/>

      <section>
        <h2>Add Vendor</h2>
        <input
          value={vendorName}
          onChange={e => setVendorName(e.target.value)}
          placeholder="Vendor Name"
        />
        <br/>
        <input
          value={vendorEmail}
          onChange={e => setVendorEmail(e.target.value)}
          placeholder="Vendor Email"
        />
        <br/>
        <button onClick={addVendor}>Add Vendor</button>

        <h3>Vendor List</h3>
        <pre>{JSON.stringify(vendors, null, 2)}</pre>
      </section>

      <hr/>

      <section>
        <h2>Send RFP</h2>
        <input
          value={rfpId}
          onChange={e => setRfpId(e.target.value)}
          placeholder="RFP ID"
        />
        <br/>
        <input
          value={vendorIds}
          onChange={e => setVendorIds(e.target.value)}
          placeholder="Vendor IDs (1,2)"
        />
        <br/>
        <button onClick={sendRfp}>Send Email</button>
        <pre>{JSON.stringify(emailResult, null, 2)}</pre>
      </section>

      <hr/>

      <section>
        <h2>Vendor Reply Parsing</h2>
        <input
          value={replyVendorId}
          onChange={e => setReplyVendorId(e.target.value)}
          placeholder="Vendor ID"
        />
        <br/>
        <textarea
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          style={{ width: "100%", height: "80px" }}
        />
        <br/>
        <button onClick={parseReply}>Parse Proposal</button>
        <pre>{JSON.stringify(proposalResult, null, 2)}</pre>
      </section>

      <hr/>

      <section>
        <h2>Compare Vendors</h2>
        <input
          value={compareId}
          onChange={e => setCompareId(e.target.value)}
          placeholder="RFP ID"
        />
        <br/>
        <button onClick={compare}>Compare</button>
        <pre>{JSON.stringify(compareResult, null, 2)}</pre>
      </section>

    </div>
  );
}
