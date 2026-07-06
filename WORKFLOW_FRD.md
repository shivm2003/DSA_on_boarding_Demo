# Functional Requirements Document (FRD): DSA Onboarding Workflow

This document outlines the roles, responsibilities, and functionalities of the two primary modules in the DSA Onboarding lifecycle: the **Channel Manager Module** and the **Product Manager Module**.

---

## 1. Overview
The DSA registration process follows a multi-tier review workflow to ensure data integrity and proper authorization.
1. **Applicant Submission:** A new DSA submits their registration (`Pending` status).
2. **Channel Manager Review:** The Channel Manager reviews the raw data and documents. If everything looks correct, the case is passed to the Product Team.
3. **Product Team Review:** The Product Team conducts a secondary review, performs any necessary data corrections, and grants final approval.
4.After approval of Product it goes for salesforce for DSA Code creation , that should be reflected from the Salesforce and Product portal and CHannel Manager Portal (In the Application form against)

## 2. Channel Manager Module

**Primary Objective:** Act as the first line of defense. Review incoming applications, verify documents, and decide whether to flag disputes or forward the case to the Product Team.

### 2.1 Key Features & Functionalities

* **Dashboard (`Dashboard.jsx`)**
  * **Metrics Grid:** High-level view of Total Active DSAs, Pending Onboarding, Total Disbursement, and Queries Raised.
  * **Recent Applications:** A quick-glance table of recent registrations and their statuses.
  * **Top Performers:** Tracking top DSA leads and disbursement targets.

* **Review Queue (`ReviewQueue.jsx`)**
  * **Application Listing:** Displays all applications with their current statuses (Pending, Approved, Query Raised, etc.).
  * **Detailed Review Mode:** Displays read-only sections of the application:
    * Applicant Details (Company Name, Entity Type, Contact Info)
    * Banking Details
    * Business & KYC Details (PAN, Aadhar, GST, MSME)
    * Service Location
    * Uploaded Documents & OCR parsed details.

### 2.2 Actions Available to Channel Manager
* **Send to Product:** Forwards the application to the Product Manager's queue. Changes status to `Send to Product`.
* **Add Dispute:** Flags an issue with the application. Changes status to `Dispute Raised` or `Query Raised`.
* **Remarks History:** Allows the Channel Manager to view a complete timestamped log of all actions, edits, and remarks made throughout the application's lifecycle.

---

## 3. Product Manager Module

**Primary Objective:** Perform the final data validation, correct any discrepancies in the application data, and approve the registration.

### 3.1 Key Features & Functionalities

* **Product Dashboard (`ProductDashboard.jsx`)**
  * **Metrics Grid:** Shows Total Submissions, Pending Review (cases sent by the Channel Manager), and Approved DSAs.
  * **Recent Pending Items:** A summary table of applications waiting in the `Send to Product` status.

* **Pending Items Workflow (`ProductPendingItems.jsx`)**
  * **Restricted Queue:** Exclusively lists applications that have been explicitly forwarded by the Channel Manager (`status === 'Send to Product'`).
  * **Edit & Review Interface:** Unlike the Channel Manager, the Product Manager has access to an interactive form allowing them to directly modify:
    * Applicant Details (Company Name, Mobile, Email, etc.)
    * Banking Details (Account Number, IFSC, Bank Name)
    * Service Location Details
  * **Automated Audit Logging:** Whenever the Product Manager saves changes, the system automatically calculates the differences (old vs. new values) and appends a detailed diff log to the **Remarks History**, including the user's name and a timestamp.

### 3.2 Actions Available to Product Manager
* **Save Changes:** Persists any edits made in the form to the database and updates the audit log.
* **Return to CM:** Rejects the application back to the Channel Manager. The Product Manager must provide a mandatory remark explaining the reason. Changes status to `Query Raised`.
* **Push Case:** Grants final approval to the DSA application. Changes status to `Approved` and removes it from the pending queue.
