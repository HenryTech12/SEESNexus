/**
 * Formats API error messages into a human-readable string.
 * Handles FastAPI/Pydantic validation error lists and standard error responses.
 */
export const formatError = (error: any, defaultMessage: string = "An error occurred"): string => {
    if (!error?.response?.data) {
        return error?.message || defaultMessage;
    }

    const data = error.response.data;

    // Handle FastAPI detail array or object
    if (data.detail) {
        if (Array.isArray(data.detail)) {
            // Pydantic validation errors: [{type, loc, msg, input}, ...]
            return data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
        }
        if (typeof data.detail === "string") {
            return data.detail;
        }
    }

    // Handle generic message property
    if (data.message) {
        return data.message;
    }

    return defaultMessage;
};
