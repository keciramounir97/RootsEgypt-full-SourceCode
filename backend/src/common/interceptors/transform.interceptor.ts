
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();

        return next.handle().pipe(
            map((data) => {
                // If data is already an API Response (handled manually), return it
                if (data && data.statusCode && data.data) return data;

                // Check if data supports pagination (Knex/Objection typical output: { results: [], total: ... })
                let meta = null;
                let finalData = data;

                if (data && data.results && typeof data.total !== 'undefined') {
                    finalData = data.results;
                    meta = { total: data.total };
                }

                return {
                    statusCode: response.statusCode,
                    message: 'Success',
                    data: finalData,
                    meta,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }
}
