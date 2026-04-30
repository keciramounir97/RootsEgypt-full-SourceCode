export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    meta?: any;
    timestamp: string;
}
