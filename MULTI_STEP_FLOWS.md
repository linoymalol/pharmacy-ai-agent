# Multi-Step Workflow Demonstrations

This document describes three multi-step workflows supported by the pharmacy AI agent.
Each workflow demonstrates clarification, reasoning, tool invocation, and response aggregation.

---

## Flow 1: Retrieve User Prescriptions and Details

**Goal**  
Allow a user to view their active prescriptions and obtain detailed information for each one.

**Steps**

1. **User Input**  
   The user asks to view their prescriptions.  
   _Example:_  
   `Show my prescriptions`

2. **Agent Clarification**  
   The agent identifies that a user identifier is required and asks the user to provide it.

3. **User Input**  
   The user provides their user ID.  
   _Example:_  
   `My user ID is user1`

4. **Tool Call – `get_user_prescriptions`**  
   The agent retrieves all prescriptions associated with the provided user ID.

6. **Final Response**  
   The agent aggregates the information and presents a structured summary of the user’s prescriptions.

---

## Flow 2: Medication Information and Stock Availability

**Goal**  
Provide information about a medication and, upon user confirmation, check its stock availability.

**Steps**

1. **User Input**  
   The user asks for information about a medication.  
   _Example:_  
   `Tell me about Atorvastatin`

2. **Tool Call – `get_medication_by_name`**  
   The agent retrieves the medication details, including active ingredient and prescription requirement.

3. **Agent Follow-Up Question**  
   The agent explains whether the medication requires a prescription and asks if the user would like to check stock availability.

4. **User Input**  
   The user confirms that they want to check availability.  
   _Example:_  
   `Yes, please check if it is in stock`

5. **Tool Call – `check_stock`**  
   The agent checks the current stock availability for the medication.

6. **Final Response**  
   The agent reports whether the medication is currently in stock.

---

## Flow 3: Prescription Medication Availability

**Goal**  
Determine whether a medication that appears in a user’s prescription is currently available in stock.

**Steps**

1. **User Input**  
   The user asks whether their prescribed medication is available.  
   _Example:_  
   `Is my prescribed medication available?`

2. **Agent Clarification**  
   The agent identifies that a user identifier is required and asks the user to provide it.

3. **User Input**  
   The user provides their user ID.  
   _Example:_  
   `My user ID is user1`

4. **Tool Call – `get_user_prescriptions`**  
   The agent retrieves the prescriptions associated with the user.

5. **Tool Call – `get_prescription_details`**  
   The agent extracts the medication associated with the prescription.

8. **Tool Call – `check_stock`**  
   The agent checks the stock availability for the prescribed medication.

9. **Final Response**  
   The agent reports whether the prescribed medication is currently available.

---

These workflows demonstrate the agent’s ability to request missing information, perform multi-step reasoning, and combine multiple tool calls within a single interaction.
