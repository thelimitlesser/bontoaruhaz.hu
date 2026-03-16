
export interface RateLimitInfo {
    count: number;
    resetTime: number;
}

const cache = new Map<string, RateLimitInfo>();

/**
 * Simple in-memory rate limiter for serverless environment.
 * Note: Under high load or frequent cold starts, persistent storage (Redis) is recommended.
 * @param key Unique identifier for the client (IP or user ID)
 * @param limit Maximum number of requests allowed within the window
 * @param windowMs Time window in milliseconds
 * @returns Object indicating if the limit is reached and remaining time
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const info = cache.get(key);

    if (!info || now > info.resetTime) {
        // First request or window expired
        const newInfo = {
            count: 1,
            resetTime: now + windowMs
        };
        cache.set(key, newInfo);
        return {
            success: true,
            remaining: limit - 1,
            reset: newInfo.resetTime
        };
    }

    if (info.count >= limit) {
        // Limit exceeded
        return {
            success: false,
            remaining: 0,
            reset: info.resetTime
        };
    }

    // Increment count
    info.count++;
    return {
        success: true,
        remaining: limit - info.count,
        reset: info.resetTime
    };
}

// Cleanup expired entries periodically to prevent memory leaks
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, info] of cache.entries()) {
            if (now > info.resetTime) {
                cache.delete(key);
            }
        }
    }, 60000); // Every minute
}
