interface ApiErrorDetail {
    msg?: string;
    [key: string]: unknown;
}

interface ApiErrorLike {
    response?: {
        data?: {
            detail?: string | ApiErrorDetail[];
            message?: string;
        };
    };
    message?: string;
}

/**
 * Formats API error messages into a human-readable string.
 * Handles FastAPI/Pydantic validation error lists and standard error responses.
 */
export const formatError = (error: unknown, defaultMessage: string = "An error occurred"): string => {
    const apiError = error as ApiErrorLike;

    if (!apiError?.response?.data) {
        return apiError?.message || defaultMessage;
    }

    const data = apiError.response.data;

    // Handle FastAPI detail array or object
    if (data.detail) {
        if (Array.isArray(data.detail)) {
            // Pydantic validation errors: [{type, loc, msg, input}, ...]
            return data.detail.map((err) => err.msg || JSON.stringify(err)).join(", ");
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
