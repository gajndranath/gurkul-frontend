/**
 * Backend ke validation logic ke hisab se
 * har error object ka structure define kiya hai.
 */
export interface ValidationError {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Standard API Error structure
 * 'any[]' ko 'ValidationError[]' se replace kiya hai.
 */
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  success: boolean;
  errors?: ValidationError[]; // Clean approach: specific type instead of any
}
