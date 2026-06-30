## Sequence Diagrams
This document presents sequence diagrams for four essential API operations in the HBnB Evolution application, showing how requests flow through the system layers.

## 1. User Registration

**Overview:** Creates a new user account by validating the provided information and securely storing it in the database.
<img width="7355" height="4095" alt="User Registration" src="https://github.com/user-attachments/assets/59f3df63-3e96-49da-8cb4-d3b038f67a5a" />


## 2. Place Creation

**Overview:** Enables authenticated users to list a new property with details and location information.
<img width="7115" height="3555" alt="Place Creation" src="https://github.com/user-attachments/assets/f2a9d32a-e87b-4dcf-9faa-bcf616a5e08a" />


## 3. Review Submission

**Overview:** Allows users to submit ratings and feedback for places they have experienced.
<img width="7390" height="4665" alt="Review Submission" src="https://github.com/user-attachments/assets/1d74d2be-999e-4697-ab61-aec95579543c" />


## 4. Fetching a List of Places

**Overview:** Retrieves places based on search criteria, including associated amenities and owner information.
<img width="6290" height="3225" alt="Fetching a List of Places" src="https://github.com/user-attachments/assets/6eef67c0-9ac1-4e08-b036-baa3404309b6" />


## Summary

These diagrams demonstrate the interaction patterns for core HBnB operations:

* **User Registration:** Focuses on data validation and secure password storage
* **Place Creation:** Validates owner existence and listing details before persistence
* **Review Submission:** Enforces uniqueness, preventing duplicate reviews from the same user
* **Fetching Places:** Demonstrates query filtering based on search criteria

