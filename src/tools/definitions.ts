export type ToolDefinition = {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<
      string,
      {
        type: string;
        description: string;
        enum?: string[];
      }
    >;
    required: string[];
    additionalProperties: false;
  };
};


export type ToolHandler = (input: unknown) => Promise<unknown>;

export type ToolHandlerMap = Record<string, ToolHandler>;

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "get_medication_by_name",
    description: "Retrieve detailed information about a medication by its name. Use this to get information about active ingredients, dosage, usage instructions, and prescription requirements.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the medication to look up (e.g., 'Aspirin', 'Amoxicillin')",
        },
      },
      required: ["name"],
      additionalProperties: false
    },
  },
  {
    name: "check_stock",
    description: "Check the current stock availability of a medication in the pharmacy inventory.",
    parameters: {
      type: "object",
      properties: {
        medicationName: {
          type: "string",
          description: "The name of the medication to check stock for",
        },
      },
      required: ["medicationName"],
      additionalProperties: false
    },
  },
  {
    name: "get_user_prescriptions",
    description: "Retrieve all active prescriptions for a specific user. Use this when a customer asks about their prescriptions or needs to refill a prescription.",
    parameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The unique identifier of the user (e.g., 'user1', 'user2')",
        },
      },
      required: ["userId"],
      additionalProperties: false
    },
  },
  {
    name: "get_prescription_details",
    description: "Get detailed information about a specific prescription including refills remaining, quantity, and prescribing doctor.",
    parameters: {
      type: "object",
      properties: {
        prescriptionId: {
          type: "string",
          description: "The unique identifier of the prescription (e.g., 'presc1', 'presc2')",
        },
      },
      required: ["prescriptionId"],
      additionalProperties: false
    },
  },
];
