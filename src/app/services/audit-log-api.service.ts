import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { AuditLog } from '../models/audit-log.model';
import { API_ENDPOINTS } from './api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuditLogApiService {
  private readonly LOGS_ENDPOINT = API_ENDPOINTS.auditLogs;

  constructor(private readonly http: HttpClient) {}

  getAllLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.LOGS_ENDPOINT).pipe(
      retry(3),
      map(logs => this.mapTimestamps(logs)),
      catchError(this.handleError)
    );
  }

  createLog(log: AuditLog): Observable<AuditLog> {
    return this.http.post<AuditLog>(this.LOGS_ENDPOINT, log).pipe(
      retry(3),
      map(response => this.mapTimestamp(response)),
      catchError(this.handleError)
    );
  }

  getPagedLogs(page: number, pageSize: number): Observable<{ logs: AuditLog[], total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<{ logs: AuditLog[], total: number }>(this.LOGS_ENDPOINT, { params }).pipe(
      retry(3),
      map(response => ({ logs: this.mapTimestamps(response.logs), total: response.total })),
      catchError(this.handleError)
    );
  }

  searchLogs(query: string): Observable<AuditLog[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<AuditLog[]>(`${this.LOGS_ENDPOINT}/search`, { params }).pipe(
      retry(3),
      map(logs => this.mapTimestamps(logs)),
      catchError(this.handleError)
    );
  }

  getLogsByEntity(entityType: string, entityId?: string): Observable<AuditLog[]> {
    let params = new HttpParams().set('type', entityType);
    if (entityId) params = params.set('entityId', entityId);
    return this.http.get<AuditLog[]>(`${this.LOGS_ENDPOINT}/entity`, { params }).pipe(
      retry(3),
      map(logs => this.mapTimestamps(logs)),
      catchError(this.handleError)
    );
  }

  deleteOldLogs(beforeDate: Date): Observable<void> {
    const params = new HttpParams().set('before', beforeDate.toISOString());
    return this.http.delete<void>(`${this.LOGS_ENDPOINT}/cleanup`, { params }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  exportLogsAsCsv(filters?: { startDate?: Date; endDate?: Date; entityType?: string }): Observable<Blob> {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params = params.set('endDate', filters.endDate.toISOString());
    if (filters?.entityType) params = params.set('entityType', filters.entityType);

    return this.http.get(`${this.LOGS_ENDPOINT}/export`, { params, responseType: 'blob' }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Status: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) errorMessage += `\nDetail: ${error.error.message}`;
    }
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private mapTimestamps(logs: AuditLog[]): AuditLog[] {
    return logs.map(l => this.mapTimestamp(l));
  }

  private mapTimestamp(log: AuditLog): AuditLog {
    return { ...log, timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp) : log.timestamp };
  }
}
