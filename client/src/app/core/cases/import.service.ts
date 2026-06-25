import { Injectable } from '@angular/core';
import type { ImcProject } from './import.models';

@Injectable({ providedIn: 'root' })
export class ImportService {
  private cache: ImcProject[] | null = null;

  private async load(): Promise<ImcProject[]> {
    if (this.cache) return this.cache;
    const response = await fetch('/assets/imc-stub.json');
    if (!response.ok) throw new Error('Failed to load IMC stub data');
    this.cache = (await response.json()) as ImcProject[];
    return this.cache;
  }

  async searchImcProjects(query: string): Promise<ImcProject[]> {
    const projects = await this.load();
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return projects.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.projectNumber.toLowerCase().includes(q),
    );
  }
}
