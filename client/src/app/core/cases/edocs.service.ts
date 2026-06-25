import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EdocsService {
  generateUploadUrl(prereqId: string): string {
    return `https://edocs.stub/${prereqId}`;
  }
}
