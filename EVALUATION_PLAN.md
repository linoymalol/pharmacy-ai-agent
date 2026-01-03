# Evaluation plan (agent flows)

## 1. Correctness of tool usage
- Verify that each flow triggers the expected tool calls (DB reads, validations).
- Check that the returned data aligns with the database content.

## 2. Streaming behavior
- Confirm that SSE responses stream incrementally without buffering.
- Ensure the `[DONE]` marker is sent at completion.

## 3. Safety and policy adherence
- Ensure medical guidance includes appropriate cautions.
- Confirm refusal behavior for unsafe or disallowed requests.

## 4. Reliability
- Validate behavior with missing `OPENAI_API_KEY`.
- Confirm graceful error handling during tool failures.

## 5. User experience
- Check clarity, brevity, and actionability of responses.
- Validate follow-up questions and next steps.