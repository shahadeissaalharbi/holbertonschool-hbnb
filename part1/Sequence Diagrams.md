## Sequence Diagrams
This document presents sequence diagrams for four essential API operations in the HBnB Evolution application, showing how requests flow through the system layers.

## 1. User Registration

**Overview:** Creates a new user account by validating the provided information and securely storing it in the database.
<img width="6530" height="5125" alt="User Registration Workflow-2026-07-09-125743" src="https://github.com/user-attachments/assets/2574cb95-fe49-4a1d-853a-cd63c0608ebb" />


## 2. Place Creation

**Overview:** Enables authenticated users to list a new property with details and location information.
<img width="7235" height="5125" alt="Place Creation Workflow-2026-07-09-125859" src="https://github.com/user-attachments/assets/8bcb7da3-5b81-4b13-9167-572806c937a1" />


## 3. Review Submission

**Overview:** Allows users to submit ratings and feedback for places they have experienced.
<img width="5878" height="8192" alt="Review Submission-2026-07-09-125943" src="https://github.com/user-attachments/assets/b472d779-1e3c-4b14-b3ac-c7fff62c9656" />



## 4. Fetching a List of Places

**Overview:** Retrieves places based on search criteria, including associated amenities and owner information.
<img width="5140" height="4645" alt="Place Filtering API Flow-2026-07-09-130038" src="https://github.com/user-attachments/assets/bd37ecfe-2779-438b-8a29-d2afcc008f60" />



## Summary

These diagrams demonstrate the interaction patterns for core HBnB operations:

* **User Registration:** Focuses on data validation and secure password storage
* **Place Creation:** Validates owner existence and listing details before persistence
* **Review Submission:** Enforces uniqueness, preventing duplicate reviews from the same user
* **Fetching Places:** Demonstrates query filtering based on search criteria

