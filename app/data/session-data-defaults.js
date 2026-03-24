module.exports = {

  // Default Pagination Settings
  itemsPerPage: 25,
  folderItemsPerPage: 25,

  // --- SEED DATA: REALISTIC CASE LIST ---
  cases: [
    {
      // Generated using: PUR + 100xx
      reference: "PUR/10045",
      externalReference: "MAN-APP-2026-001",
      historicalReference: "HIST-9901-A",
      caseName: "Land at 14 High Street, Manchester (Generated)",
      caseStatus: "In progress",
      
      "casework-area": "Planning, Environmental and Applications",
      areaValue: "planning-environmental-and-applications",
      typeValue: "purchase-notices",
      subtypeValue: "", 
      
      type: "Purchase Notices",
      subtype: "",
      act: "Town and Country Planning Act 1990, 78", 
      "consent-sought": "Town and Country Planning Act 1990, 78",
      priority: "High",
      "inspector-band": "Band 2",
      modificationStatus: "Advertised modification 1",
      
      authorityName: "Manchester City Council",
      siteAddress: "14 High Street<br>Manchester<br>Greater Manchester<br>M1 1DZ",
      addressLine1: "14 High Street",
      addressLine2: "",
      addressTown: "Manchester",
      addressCounty: "Greater Manchester",
      addressPostcode: "M1 1DZ",
      siteLocation: "Grid Ref: SJ 839 983",
      offlineDocLocation: "Filing Cabinet 4, Floor 2\nTemple Quay House",
      relevantWebsiteLinks: "https://planning.manchester.gov.uk/portal/14-high-street",

      caseOfficer: "Kieran De La Cruz",
      inspectors: [
        { id: "insp-1", name: "Sarah Tudor", date: "12 February 2026", rawDay: "12", rawMonth: "2", rawYear: "2026" }
      ],
      
      applicants: [
        { id: "app-1", firstName: "Michael", lastName: "Chang", companyName: "High Street Retail Ltd", address: { line1: "1 Corporate Way", town: "London", postcode: "WC1X 8JZ", formatted: "1 Corporate Way<br>London<br>WC1X 8JZ" }, email: "m.chang@highstreetretail.co.uk", phone: "07700 900 123" },
        { id: "app-2", firstName: "Elena", lastName: "Rostova", companyName: "High Street Retail Ltd", email: "e.rostova@highstreetretail.co.uk" },
        { id: "app-3", firstName: "David", lastName: "Smith", companyName: "Smith & Sons Legal Reps" }
      ],
      objectors: [{ id: "obj-1", fname: "Local Residents Association" }, { id: "obj-2", fname: "Mr. T. Barnaby" }],
      contacts: [{ id: "con-1", fname: "Jane Doe", org: "Manchester Planning Dept" }],

      relatedCases: [{ id: "rc-1", reference: "PUR/10044" }],
      linkedCases: [],

      expectedSubmissionDate: { day: "1", month: "5", year: "2026", formatted: "1 May 2026" },
      caseReceivedDate: { day: "15", month: "1", year: "2026", formatted: "15 January 2026" },
      targetDecisionDate: { day: "30", month: "9", year: "2026", formatted: "30 September 2026" },
      startDate: { day: "20", month: "1", year: "2026", formatted: "20 January 2026" },
      objectionPeriodEndDate: { day: "28", month: "2", year: "2026", formatted: "28 February 2026" },
      decisionNotificationDate: { day: "1", month: "9", year: "2026", formatted: "1 September 2026" },
      decisionIssuedByDate: { day: "15", month: "10", year: "2026", formatted: "15 October 2026" },

      overviewProcedures: [
        {
          id: "proc-1", type: "Hearing", status: "Scheduled", inspector: "Sarah Tudor", 
          siteVisit: { day: "10", month: "4", year: "2026", formatted: "10 April 2026" }, 
          siteVisitType: "Accompanied", 
          cmcDate: { day: "20", month: "4", year: "2026", hour: "10", minute: "00", ampm: "am", formattedDate: "20 April 2026", formattedTime: "10:00am" }, 
          cmcType: "Virtual", 
          cmcVenue: { line1: "Microsoft Teams", formatted: "Microsoft Teams" }, 
          confirmedHearing: { day: "15", month: "5", year: "2026", hour: "9", minute: "30", ampm: "am", formattedDate: "15 May 2026", formattedTime: "9:30am" }, 
          hearingType: "In-person", 
          hearingVenue: { line1: "Manchester Civic Centre", line2: "Committee Room 1", formatted: "Manchester Civic Centre<br>Committee Room 1" },
          hearingPrepTime: "2", hearingTravelTime: "1", hearingSittingTime: "2", hearingReportingTime: "3"
        },
        {
          id: "proc-2", type: "Site visit", status: "Completed", siteVisitType: "Access required", inspector: "Sarah Tudor", 
          siteVisit: { day: "10", month: "2", year: "2026", formatted: "10 February 2026" }
        }
      ],

      outcomeOverview: {},
      outcomes: [],
      
      invoicing: { rechargeable: "Yes", finalCost: "1250.00", invoiceSent: "Interim invoice sent", feeReceived: "No" },

      caseNotes: [
        { text: "Hearing venue confirmed with Manchester council.", meta: "2:15pm on Thursday 19 March 2026 by Steve Waterfield", tableDate: "19 March 2026", tableTime: "2:15pm", tableUser: "Steve Waterfield" },
        { text: "Appellant requested an extension for submitting proofs of evidence.", meta: "11:30am on Tuesday 17 March 2026 by Kieran De La Cruz", tableDate: "17 March 2026", tableTime: "11:30am", tableUser: "Kieran De La Cruz" },
        { text: "Site visit completed. Access was granted without issue.", meta: "4:00pm on Tuesday 10 February 2026 by Sarah Tudor", tableDate: "10 February 2026", tableTime: "4:00pm", tableUser: "Sarah Tudor" },
        { text: "Case officer assigned and initial validation passed.", meta: "9:15am on Tuesday 20 January 2026 by System", tableDate: "20 January 2026", tableTime: "9:15am", tableUser: "System" },
        { text: "Purchase notice application received via portal.", meta: "10:00am on Thursday 15 January 2026 by System", tableDate: "15 January 2026", tableTime: "10:00am", tableUser: "System" }
      ],

      folders: [
        { id: "f1", name: "Initial documentation", slug: "initial-documentation", subfolders: [], documents: [
          { id: "doc-1", name: "Valuation-Report.pdf", type: "PDF", size: "2.1 MB", date: "15 Jan 2026", dateTimestamp: 1736937600, readStatus: "Read", isFlagged: false },
          { id: "doc-1a", name: "Application-Form-Final.pdf", type: "PDF", size: "450 KB", date: "15 Jan 2026", dateTimestamp: 1736940000, readStatus: "Read", isFlagged: false },
          { id: "doc-1b", name: "Site-Plan-Detailed.png", type: "PNG", size: "4.8 MB", date: "16 Jan 2026", dateTimestamp: 1737024000, readStatus: "Unread", isFlagged: true }
        ]},
        { id: "f2", name: "Procedure", slug: "procedure", subfolders: [], documents: [
          { id: "doc-2a", name: "Inspector-Allocation-Notice.pdf", type: "PDF", size: "120 KB", date: "12 Feb 2026", dateTimestamp: 1739356800, readStatus: "Read", isFlagged: false }
        ]},
        { id: "f3", name: "Statements of case / final comments", slug: "statements-of-case-final-comments", documents: [], subfolders: [
          { id: "f3-sub1", name: "Statements of case", slug: "statements-of-case", subfolders: [], documents: [
            { id: "doc-3a", name: "Appellant-Statement-Of-Case.docx", type: "DOCX", size: "1.4 MB", date: "05 Mar 2026", dateTimestamp: 1741171200, readStatus: "Unread", isFlagged: false },
            { id: "doc-3b", name: "LPA-Statement-Of-Case.pdf", type: "PDF", size: "890 KB", date: "07 Mar 2026", dateTimestamp: 1741344000, readStatus: "Unread", isFlagged: false }
          ]},
          { id: "f3-sub2", name: "Final comments", slug: "final-comments", subfolders: [], documents: [
            { id: "doc-3c", name: "Appellant-Final-Comments.pdf", type: "PDF", size: "300 KB", date: "18 Mar 2026", dateTimestamp: 1742294400, readStatus: "Unread", isFlagged: true }
          ]}
        ]},
        { id: "f4", name: "Proofs of evidence, Rebuttals and Statement of Common Ground (if inquiry)", slug: "proofs-of-evidence-rebuttals-and-statement-of-common-ground-if-inquiry-", subfolders: [], documents: [
          { id: "doc-4a", name: "Proof-of-Evidence-Town-Planning.pdf", type: "PDF", size: "3.5 MB", date: "10 Apr 2026", dateTimestamp: 1744281600, readStatus: "Unread", isFlagged: false }
        ]},
        { id: "f5", name: "Start Date Letters", slug: "start-date-letters", subfolders: [], documents: [] },
        { id: "f6", name: "Events information and notifications", slug: "events-information-and-notifications", documents: [], subfolders: [
          { id: "f6-sub1", name: "Pre-inquiry meeting or Case management conference", slug: "pre-inquiry-meeting-or-case-management-conference", subfolders: [], documents: [
            { id: "doc-6a", name: "CMC-Notes-Draft.docx", type: "DOCX", size: "22 KB", date: "22 Apr 2026", dateTimestamp: 1745318400, readStatus: "Read", isFlagged: false }
          ]},
          { id: "f6-sub2", name: "Site Visit information (if written reps)", slug: "site-visit-information-if-written-reps-", subfolders: [], documents: [] },
          { id: "f6-sub3", name: "Inquiry notice", slug: "inquiry-notice", subfolders: [], documents: [] }
        ]},
        { id: "f7", name: "Decision / report", slug: "decision-report", subfolders: [], documents: [
          { id: "doc-7a", name: "Draft-Inspector-Report.docx", type: "DOCX", size: "55 KB", date: "20 Mar 2026", dateTimestamp: 1742467200, readStatus: "Unread", isFlagged: true }
        ]},
        { id: "f8", name: "Invoice", slug: "invoice", subfolders: [], documents: [] },
        { id: "f9", name: "Costs", slug: "costs", subfolders: [], documents: [] },
        { id: "f10", name: "Other", slug: "other", subfolders: [], documents: [] }
      ],
      
      lastModified: "19 March 2026",
      lastModifiedBy: "Steve Waterfield"
    },
    
    {
      // Generated using: COM + WCL + 100xx
      reference: "COM/WCL/10088",
      caseName: "Cornwall Coastal Preservation Works (Generated)",
      caseStatus: "Closed", 
      caseClosedDate: "15 December 2025 at 9:00am", 
      
      "casework-area": "Rights of Way and Common Land",
      areaValue: "rights-of-way-and-common-land",
      typeValue: "common-land",
      subtypeValue: "works-on-common-land",
      
      type: "Common Land",
      subtype: "Works on Common Land",
      act: "Commons Act 2006, 38",
      "consent-sought": "Commons Act 2006, 38", 
      priority: "Medium", 
      "inspector-band": "Band 1",
      
      authorityName: "Cornwall Council", 
      siteAddress: "Cornwall Coast<br>Cornwall",
      
      caseOfficer: "Steve Waterfield", 
      inspectors: [{ id: "insp-1", name: "Alex Hudd", date: "5 November 2025", rawDay: "5", rawMonth: "11", rawYear: "2025" }],
      applicants: [{ id: "app-1", firstName: "David", lastName: "Attenborough", companyName: "National Trust" }],
      objectors: [], contacts: [], relatedCases: [], linkedCases: [],
      
      caseReceivedDate: { day: "1", month: "10", year: "2025", formatted: "1 October 2025" },
      targetDecisionDate: { day: "10", month: "12", year: "2025", formatted: "10 December 2025" },
      startDate: { day: "5", month: "10", year: "2025", formatted: "5 October 2025" },

      overviewProcedures: [
        {
          id: "proc-1", type: "Written representations", status: "Completed", inspector: "Alex Hudd", 
          siteVisit: { day: "20", month: "11", year: "2025", formatted: "20 November 2025" }, 
          siteVisitType: "Unaccompanied",
          writtenRepsDate: { day: "1", month: "11", year: "2025", formatted: "1 November 2025" }
        }
      ],

      outcomeOverview: {
        partiesNotifiedDate: { day: "12", month: "12", year: "2025", formatted: "12 December 2025" },
        orderDispatchDate: { day: "13", month: "12", year: "2025", formatted: "13 December 2025" },
        decisionPublishedDate: { day: "15", month: "12", year: "2025", formatted: "15 December 2025" }
      },
      outcomes: [
        { id: "out-1", type: "Decision", originator: "Inspector", inspectorName: "Alex Hudd", decisionOutcome: "Allowed", decisionOutcomeDetails: "Consent granted with standard conditions", outcomeDate: { day: "10", month: "12", year: "2025", formatted: "10 December 2025" } }
      ],

      invoicing: { rechargeable: "No" }, 

      caseNotes: [
        { text: "Case closed and archived.", meta: "9:00am on Monday 15 December 2025 by Steve Waterfield", tableDate: "15 December 2025", tableTime: "9:00am", tableUser: "Steve Waterfield" },
        { text: "Decision issued to all parties.", meta: "3:30pm on Friday 12 December 2025 by System", tableDate: "12 December 2025", tableTime: "3:30pm", tableUser: "System" }
      ],

      folders: [
        { id: "f1", name: "Application documents", slug: "application-documents", subfolders: [], documents: [
          { id: "doc-cl-1", name: "Section-38-Application-Form.pdf", type: "PDF", size: "650 KB", date: "01 Oct 2025", dateTimestamp: 1727740800, readStatus: "Read", isFlagged: false },
          { id: "doc-cl-2", name: "Environmental-Impact-Assessment.pdf", type: "PDF", size: "8.4 MB", date: "01 Oct 2025", dateTimestamp: 1727741800, readStatus: "Read", isFlagged: false },
          { id: "doc-cl-3", name: "Proposed-Works-Diagram.jpg", type: "JPG", size: "3.1 MB", date: "01 Oct 2025", dateTimestamp: 1727742800, readStatus: "Read", isFlagged: false }
        ]},
        { id: "f2", name: "Public representations", slug: "public-representations", subfolders: [], documents: [
          { id: "doc-cl-4", name: "Representation-001-Smith.pdf", type: "PDF", size: "110 KB", date: "20 Oct 2025", dateTimestamp: 1729382400, readStatus: "Read", isFlagged: false },
          { id: "doc-cl-5", name: "Representation-002-Ramblers.pdf", type: "PDF", size: "225 KB", date: "25 Oct 2025", dateTimestamp: 1729814400, readStatus: "Unread", isFlagged: true }
        ]},
        { id: "f3", name: "Applicant response to representations", slug: "applicant-response-to-representations", subfolders: [], documents: [
          { id: "doc-cl-6", name: "Applicant-Response-to-Ramblers.docx", type: "DOCX", size: "45 KB", date: "02 Nov 2025", dateTimestamp: 1730505600, readStatus: "Read", isFlagged: false }
        ]},
        { id: "f4", name: "Correspondence with applicant, representations parties, other parties, registration authority & internal/inspector", slug: "correspondence-with-applicant-representations-parties-other-parties-registration-authority-internal-inspector", subfolders: [], documents: [
          { id: "doc-cl-7", name: "Email-to-Registration-Authority.pdf", type: "PDF", size: "80 KB", date: "15 Nov 2025", dateTimestamp: 1731628800, readStatus: "Read", isFlagged: false }
        ]},
        { id: "f5", name: "Hearing documents", slug: "hearing-documents", subfolders: [], documents: [] },
        { id: "f6", name: "Decision", slug: "decision", subfolders: [], documents: [
          { id: "doc-2", name: "Final-Decision-COM-10088.pdf", type: "PDF", size: "450 KB", date: "10 Dec 2025", dateTimestamp: 1733788800, readStatus: "Read", isFlagged: false },
          { id: "doc-cl-8", name: "Sealed-Order-Copy.pdf", type: "PDF", size: "1.1 MB", date: "12 Dec 2025", dateTimestamp: 1733961600, readStatus: "Read", isFlagged: false }
        ]},
        { id: "f7", name: "Other", slug: "other", subfolders: [], documents: [] }
      ],
      
      lastModified: "15 December 2025",
      lastModifiedBy: "Steve Waterfield"
    },

    {
      // Generated using: CPO + HOU + 100xx
      reference: "CPO/HOU/10012",
      caseName: "Bristol City Centre Housing CPO (Generated)",
      caseStatus: "New case", 
      
      "casework-area": "Planning, Environmental and Applications",
      areaValue: "planning-environmental-and-applications",
      typeValue: "housing-and-planning-cpos",
      subtypeValue: "housing",
      
      type: "Housing and Planning CPOs",
      subtype: "Housing",
      
      authorityName: "Bristol City Council", 
      caseOfficer: "Edward Mitchell", 
      
      applicants: [{ id: "app-1", firstName: "Sarah", lastName: "Connor", companyName: "Bristol City Council" }],
      inspectors: [], objectors: [], contacts: [], relatedCases: [], linkedCases: [],
      
      caseReceivedDate: { day: "23", month: "3", year: "2026", formatted: "23 March 2026" },
      overviewProcedures: [],
      outcomeOverview: {},
      outcomes: [],
      invoicing: {},
      
      caseNotes: [
        { text: "New CPO application submitted. Validation required.", meta: "9:05am on Monday 23 March 2026 by System", tableDate: "23 March 2026", tableTime: "9:05am", tableUser: "System" }
      ],

      folders: [
        { id: "f1", name: "Initial documentation", slug: "initial-documentation", subfolders: [], documents: [
          { id: "doc-3", name: "Draft-CPO-Order.docx", type: "DOCX", size: "1.2 MB", date: "23 Mar 2026", dateTimestamp: 1742720400, readStatus: "Unread", isFlagged: false },
          { id: "doc-cpo-1", name: "Statement-of-Reasons.pdf", type: "PDF", size: "3.4 MB", date: "23 Mar 2026", dateTimestamp: 1742721400, readStatus: "Unread", isFlagged: true }
        ]},
        { id: "f2", name: "Procedure", slug: "procedure", subfolders: [], documents: [] },
        { id: "f3", name: "Statements of case / final comments", slug: "statements-of-case-final-comments", documents: [], subfolders: [
          { id: "f3-sub1", name: "Statements of case", slug: "statements-of-case", subfolders: [], documents: [] },
          { id: "f3-sub2", name: "Final comments", slug: "final-comments", subfolders: [], documents: [] }
        ]},
        { id: "f4", name: "Proofs of evidence, Rebuttals and Statement of Common Ground (if inquiry)", slug: "proofs-of-evidence-rebuttals-and-statement-of-common-ground-if-inquiry-", subfolders: [], documents: [] },
        { id: "f5", name: "Start Date Letters", slug: "start-date-letters", subfolders: [], documents: [] },
        { id: "f6", name: "Events information and notifications", slug: "events-information-and-notifications", documents: [], subfolders: [
          { id: "f6-sub1", name: "Pre-inquiry meeting or Case management conference", slug: "pre-inquiry-meeting-or-case-management-conference", subfolders: [], documents: [] },
          { id: "f6-sub2", name: "Site Visit information (if written reps)", slug: "site-visit-information-if-written-reps-", subfolders: [], documents: [] },
          { id: "f6-sub3", name: "Inquiry notice", slug: "inquiry-notice", subfolders: [], documents: [] }
        ]},
        { id: "f7", name: "Decision / report", slug: "decision-report", subfolders: [], documents: [] },
        { id: "f8", name: "Invoice", slug: "invoice", subfolders: [], documents: [] },
        { id: "f9", name: "Costs", slug: "costs", subfolders: [], documents: [] },
        { id: "f10", name: "Other", slug: "other", subfolders: [], documents: [] }
      ],

      lastModified: "23 March 2026",
      lastModifiedBy: "System"
    },

    // =======================================================================
    // CAROL DANVERS' CASELOAD (5 CASES)
    // =======================================================================
    {
      reference: "WAY/LIN/10051",
      caseName: "National Grid Expansion - Peak District (Generated)",
      caseStatus: "In progress",
      "casework-area": "Planning, Environmental and Applications",
      areaValue: "planning-environmental-and-applications",
      typeValue: "wayleaves",
      subtypeValue: "new-lines",
      type: "Wayleaves",
      subtype: "New lines",
      authorityName: "Sheffield City Council",
      caseOfficer: "Carol Danvers",
      inspectors: [{ id: "insp-2", name: "Tony Stark", date: "15 April 2026", rawDay: "15", rawMonth: "4", rawYear: "2026" }],
      applicants: [{ id: "app-4", firstName: "Pepper", lastName: "Potts", companyName: "Stark Industries Energy" }],
      objectors: [{ id: "obj-3", fname: "Peak District Heritage Trust" }],
      contacts: [], relatedCases: [], linkedCases: [],
      
      expectedSubmissionDate: { day: "10", month: "5", year: "2026", formatted: "10 May 2026" },
      startDate: { day: "1", month: "4", year: "2026", formatted: "1 April 2026" },
      
      overviewProcedures: [
        { id: "proc-3", type: "Hearing", status: "Scheduled", inspector: "Tony Stark", earliestHearingDate: { day: "20", month: "5", year: "2026", formatted: "20 May 2026" } }
      ],
      outcomeOverview: {}, outcomes: [], invoicing: { rechargeable: "Yes" },
      
      caseNotes: [{ text: "Hearing scheduled, waiting on venue confirmation.", meta: "10:00am on Monday 20 April 2026 by Carol Danvers", tableDate: "20 April 2026", tableTime: "10:00am", tableUser: "Carol Danvers" }],
      
      folders: [
        { id: "f1", name: "Initial documentation", slug: "initial-documentation", subfolders: [], documents: [
          { id: "doc-w1", name: "Route-Proposal.pdf", type: "PDF", size: "12 MB", date: "01 Apr 2026", dateTimestamp: 1743465600, readStatus: "Read", isFlagged: false }
        ]},
        { id: "f2", name: "Procedure", slug: "procedure", subfolders: [], documents: [] },
        { id: "f3", name: "Statements of case / final comments", slug: "statements-of-case-final-comments", documents: [], subfolders: [
          { id: "f3-sub1", name: "Statements of case", slug: "statements-of-case", subfolders: [], documents: [] },
          { id: "f3-sub2", name: "Final comments", slug: "final-comments", subfolders: [], documents: [] }
        ]},
        { id: "f4", name: "Proofs of evidence, Rebuttals and Statement of Common Ground (if inquiry)", slug: "proofs-of-evidence-rebuttals-and-statement-of-common-ground-if-inquiry-", subfolders: [], documents: [] },
        { id: "f5", name: "Start Date Letters", slug: "start-date-letters", subfolders: [], documents: [] },
        { id: "f6", name: "Events information and notifications", slug: "events-information-and-notifications", documents: [], subfolders: [
          { id: "f6-sub1", name: "Pre-inquiry meeting or Case management conference", slug: "pre-inquiry-meeting-or-case-management-conference", subfolders: [], documents: [] },
          { id: "f6-sub2", name: "Site Visit information (if written reps)", slug: "site-visit-information-if-written-reps-", subfolders: [], documents: [] },
          { id: "f6-sub3", name: "Inquiry notice", slug: "inquiry-notice", subfolders: [], documents: [] }
        ]},
        { id: "f7", name: "Decision / report", slug: "decision-report", subfolders: [], documents: [] },
        { id: "f8", name: "Invoice", slug: "invoice", subfolders: [], documents: [] },
        { id: "f9", name: "Costs", slug: "costs", subfolders: [], documents: [] },
        { id: "f10", name: "Other", slug: "other", subfolders: [], documents: [] }
      ],
      lastModified: "20 April 2026", lastModifiedBy: "Carol Danvers"
    },

    {
      reference: "MCA/OBJ/10052",
      caseName: "South West Coast Path Objection (Generated)",
      caseStatus: "Ready for inspector",
      "casework-area": "Rights of Way and Common Land",
      areaValue: "rights-of-way-and-common-land",
      typeValue: "coastal-access",
      subtypeValue: "objection",
      type: "Coastal Access",
      subtype: "Objection",
      authorityName: "Cornwall Council",
      caseOfficer: "Carol Danvers",
      inspectors: [], 
      applicants: [{ id: "app-5", firstName: "Arthur", lastName: "Pendragon", companyName: "Tintagel Estates" }],
      objectors: [], contacts: [], relatedCases: [], linkedCases: [],
      
      caseReceivedDate: { day: "14", month: "4", year: "2026", formatted: "14 April 2026" },
      startDate: { day: "18", month: "4", year: "2026", formatted: "18 April 2026" },
      overviewProcedures: [], outcomeOverview: {}, outcomes: [], invoicing: { rechargeable: "No" },
      
      caseNotes: [{ text: "File prepared and ready for inspector allocation.", meta: "11:15am on Friday 24 April 2026 by Carol Danvers", tableDate: "24 April 2026", tableTime: "11:15am", tableUser: "Carol Danvers" }],
      
      // COASTAL ACCESS FOLDERS
      folders: [
        { id: "f1", name: "Letters", slug: "letters", subfolders: [], documents: [] },
        { id: "f2", name: "Internal correspondence", slug: "internal-correspondence", subfolders: [], documents: [] },
        { id: "f3", name: "Submissions", slug: "submissions", subfolders: [], documents: [
          { id: "doc-ca1", name: "Objection-Form-Final.pdf", type: "PDF", size: "1.2 MB", date: "14 Apr 2026", dateTimestamp: 1744588800, readStatus: "Read", isFlagged: false }
        ]},
        { id: "f4", name: "Notices and order documents", slug: "notices-and-order-documents", subfolders: [], documents: [] },
        { id: "f5", name: "Decision", slug: "decision", subfolders: [], documents: [] },
        { id: "f6", name: "Advertised modifications", slug: "advertised-modifications", documents: [], subfolders: [
          { id: "f6-sub1", name: "Communications", slug: "communications", subfolders: [], documents: [] },
          { id: "f6-sub2", name: "Representations", slug: "representations", subfolders: [], documents: [] },
          { id: "f6-sub3", name: "New Decision", slug: "new-decision", subfolders: [], documents: [] }
        ]},
        { id: "f7", name: "Other", slug: "other", subfolders: [], documents: [] }
      ],
      lastModified: "24 April 2026", lastModifiedBy: "Carol Danvers"
    },

    {
      reference: "SOS/ENV/10053",
      caseName: "Greenfield Farm DEFRA CPO (Generated)",
      caseStatus: "Closed",
      caseClosedDate: "16 March 2026 at 4:45pm", 
      
      "casework-area": "Planning, Environmental and Applications",
      areaValue: "planning-environmental-and-applications",
      typeValue: "other-secretary-of-state-casework",
      subtypeValue: "defra-cpo",
      type: "Other Secretary of State casework",
      subtype: "DEFRA CPO",
      authorityName: "York City Council",
      caseOfficer: "Carol Danvers",
      inspectors: [{ id: "insp-3", name: "Bruce Banner", date: "10 January 2026", rawDay: "10", rawMonth: "1", rawYear: "2026" }],
      applicants: [{ id: "app-6", firstName: "Emily", lastName: "Stone", companyName: "DEFRA" }],
      objectors: [], contacts: [], relatedCases: [], linkedCases: [],
      
      startDate: { day: "5", month: "1", year: "2026", formatted: "5 January 2026" },
      
      overviewProcedures: [
        { id: "proc-4", type: "Inquiry", status: "Completed", inspector: "Bruce Banner", inquiryClosed: { day: "28", month: "2", year: "2026", formatted: "28 February 2026" } }
      ],
      outcomeOverview: { decisionPublishedDate: { day: "15", month: "3", year: "2026", formatted: "15 March 2026" } },
      outcomes: [
        { id: "out-2", type: "Decision", originator: "Secretary of State", decisionOutcome: "Confirmed with modifications", outcomeDate: { day: "10", month: "3", year: "2026", formatted: "10 March 2026" } }
      ],
      invoicing: { rechargeable: "Yes", finalCost: "4500.00", invoiceSent: "Yes", feeReceived: "Yes" },
      
      caseNotes: [{ text: "Case closed. All files archived.", meta: "4:45pm on Monday 16 March 2026 by Carol Danvers", tableDate: "16 March 2026", tableTime: "4:45pm", tableUser: "Carol Danvers" }],
      
      folders: [
        { id: "f1", name: "Initial documentation", slug: "initial-documentation", subfolders: [], documents: [] },
        { id: "f2", name: "Procedure", slug: "procedure", subfolders: [], documents: [] },
        { id: "f3", name: "Statements of case / final comments", slug: "statements-of-case-final-comments", documents: [], subfolders: [
          { id: "f3-sub1", name: "Statements of case", slug: "statements-of-case", subfolders: [], documents: [] },
          { id: "f3-sub2", name: "Final comments", slug: "final-comments", subfolders: [], documents: [] }
        ]},
        { id: "f4", name: "Proofs of evidence, Rebuttals and Statement of Common Ground (if inquiry)", slug: "proofs-of-evidence-rebuttals-and-statement-of-common-ground-if-inquiry-", subfolders: [], documents: [] },
        { id: "f5", name: "Start Date Letters", slug: "start-date-letters", subfolders: [], documents: [] },
        { id: "f6", name: "Events information and notifications", slug: "events-information-and-notifications", documents: [], subfolders: [
          { id: "f6-sub1", name: "Pre-inquiry meeting or Case management conference", slug: "pre-inquiry-meeting-or-case-management-conference", subfolders: [], documents: [] },
          { id: "f6-sub2", name: "Site Visit information (if written reps)", slug: "site-visit-information-if-written-reps-", subfolders: [], documents: [] },
          { id: "f6-sub3", name: "Inquiry notice", slug: "inquiry-notice", subfolders: [], documents: [] }
        ]},
        { id: "f7", name: "Decision / report", slug: "decision-report", subfolders: [], documents: [
          { id: "doc-def1", name: "Final-Decision-Notice.pdf", type: "PDF", size: "2.4 MB", date: "15 Mar 2026", dateTimestamp: 1742083200, readStatus: "Read", isFlagged: false }
        ]},
        { id: "f8", name: "Invoice", slug: "invoice", subfolders: [], documents: [] },
        { id: "f9", name: "Costs", slug: "costs", subfolders: [], documents: [] },
        { id: "f10", name: "Other", slug: "other", subfolders: [], documents: [] }
      ],
      lastModified: "16 March 2026", lastModifiedBy: "Carol Danvers"
    },

    {
      reference: "CPO/ADH/10054",
      caseName: "Wandsworth High Street Regeneration (Generated)",
      caseStatus: "New case",
      "casework-area": "Planning, Environmental and Applications",
      areaValue: "planning-environmental-and-applications",
      typeValue: "housing-and-planning-cpos",
      subtypeValue: "ad-hoc",
      type: "Housing and Planning CPOs",
      subtype: "Ad hoc",
      authorityName: "Wandsworth Borough Council",
      caseOfficer: "Carol Danvers",
      inspectors: [], applicants: [], objectors: [], contacts: [], relatedCases: [], linkedCases: [],
      
      caseReceivedDate: { day: "1", month: "5", year: "2026", formatted: "1 May 2026" },
      overviewProcedures: [], outcomeOverview: {}, outcomes: [], invoicing: {}, caseNotes: [],
      
      folders: [
        { id: "f1", name: "Initial documentation", slug: "initial-documentation", subfolders: [], documents: [
          { id: "doc-ad1", name: "Application-Form.pdf", type: "PDF", size: "1.1 MB", date: "01 May 2026", dateTimestamp: 1746057600, readStatus: "Unread", isFlagged: false }
        ]},
        { id: "f2", name: "Procedure", slug: "procedure", subfolders: [], documents: [] },
        { id: "f3", name: "Statements of case / final comments", slug: "statements-of-case-final-comments", documents: [], subfolders: [
          { id: "f3-sub1", name: "Statements of case", slug: "statements-of-case", subfolders: [], documents: [] },
          { id: "f3-sub2", name: "Final comments", slug: "final-comments", subfolders: [], documents: [] }
        ]},
        { id: "f4", name: "Proofs of evidence, Rebuttals and Statement of Common Ground (if inquiry)", slug: "proofs-of-evidence-rebuttals-and-statement-of-common-ground-if-inquiry-", subfolders: [], documents: [] },
        { id: "f5", name: "Start Date Letters", slug: "start-date-letters", subfolders: [], documents: [] },
        { id: "f6", name: "Events information and notifications", slug: "events-information-and-notifications", documents: [], subfolders: [
          { id: "f6-sub1", name: "Pre-inquiry meeting or Case management conference", slug: "pre-inquiry-meeting-or-case-management-conference", subfolders: [], documents: [] },
          { id: "f6-sub2", name: "Site Visit information (if written reps)", slug: "site-visit-information-if-written-reps-", subfolders: [], documents: [] },
          { id: "f6-sub3", name: "Inquiry notice", slug: "inquiry-notice", subfolders: [], documents: [] }
        ]},
        { id: "f7", name: "Decision / report", slug: "decision-report", subfolders: [], documents: [] },
        { id: "f8", name: "Invoice", slug: "invoice", subfolders: [], documents: [] },
        { id: "f9", name: "Costs", slug: "costs", subfolders: [], documents: [] },
        { id: "f10", name: "Other", slug: "other", subfolders: [], documents: [] }
      ],
      lastModified: "1 May 2026", lastModifiedBy: "Carol Danvers"
    },

    {
      reference: "ROW/DMM/10055",
      caseName: "Camden Lock Path Modification (Generated)",
      caseStatus: "LPA questionnaire",
      "casework-area": "Rights of Way and Common Land",
      areaValue: "rights-of-way-and-common-land",
      typeValue: "rights-of-way",
      subtypeValue: "opposed-definitive-map-modification-order-dmmo-",
      type: "Rights of Way",
      subtype: "Opposed Definitive Map Modification Order (DMMO)",
      authorityName: "Camden London Borough Council",
      caseOfficer: "Carol Danvers",
      inspectors: [], 
      applicants: [{ id: "app-7", firstName: "Sam", lastName: "Wilson", companyName: "London Walkers Association" }],
      objectors: [{ id: "obj-4", fname: "Camden Market Traders" }], 
      contacts: [], relatedCases: [], linkedCases: [],
      
      startDate: { day: "10", month: "4", year: "2026", formatted: "10 April 2026" },
      
      overviewProcedures: [], outcomeOverview: {}, outcomes: [], invoicing: {},
      
      caseNotes: [{ text: "LPA Questionnaire sent. Awaiting response.", meta: "9:30am on Monday 13 April 2026 by Carol Danvers", tableDate: "13 April 2026", tableTime: "9:30am", tableUser: "Carol Danvers" }],
      
      // ROW FOLDERS
      folders: [
        { id: "f1", name: "Letters", slug: "letters", subfolders: [], documents: [
          { id: "doc-rw1", name: "Questionnaire-Request.pdf", type: "PDF", size: "150 KB", date: "13 Apr 2026", dateTimestamp: 1744502400, readStatus: "Read", isFlagged: false }
        ]},
        { id: "f2", name: "Internal correspondence", slug: "internal-correspondence", subfolders: [], documents: [] },
        { id: "f3", name: "Submissions", slug: "submissions", subfolders: [], documents: [] },
        { id: "f4", name: "Notices and order documents", slug: "notices-and-order-documents", subfolders: [], documents: [] },
        { id: "f5", name: "Decision", slug: "decision", subfolders: [], documents: [] },
        { id: "f6", name: "Advertised modifications", slug: "advertised-modifications", documents: [], subfolders: [
          { id: "f6-sub1", name: "Communications", slug: "communications", subfolders: [], documents: [] },
          { id: "f6-sub2", name: "Representations", slug: "representations", subfolders: [], documents: [] },
          { id: "f6-sub3", name: "New Decision", slug: "new-decision", subfolders: [], documents: [] }
        ]},
        { id: "f7", name: "Other", slug: "other", subfolders: [], documents: [] }
      ],
      lastModified: "13 April 2026", lastModifiedBy: "Carol Danvers"
    }
  ]
}