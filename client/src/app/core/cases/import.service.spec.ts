import { TestBed } from '@angular/core/testing';
import { ImportService } from './import.service';

const STUB: unknown[] = [
  {
    id: 'imc-001',
    projectNumber: '2024-001',
    name: 'River View Apartments',
    address: '1200 River Rd',
    developerEmail: 'dev@demo.com',
    milestones: [],
  },
  {
    id: 'imc-002',
    projectNumber: '2024-017',
    name: 'Oakwood Family Homes',
    address: '450 Oak St',
    developerEmail: 'dev@demo.com',
    milestones: [],
  },
  {
    id: 'imc-003',
    projectNumber: '2023-089',
    name: 'Cedar Creek Senior Living',
    address: '780 Cedar Creek Blvd',
    developerEmail: 'dev@demo.com',
    milestones: [],
  },
];

function mockFetch(data: unknown[]): void {
  spyOn(window, 'fetch').and.returnValue(
    Promise.resolve(new Response(JSON.stringify(data), { status: 200 })),
  );
}

describe('ImportService', () => {
  let service: ImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportService);
    // Reset cache between tests
    (service as unknown as { cache: unknown }).cache = null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns empty array for query shorter than 2 characters', async () => {
    mockFetch(STUB);
    expect(await service.searchImcProjects('')).toEqual([]);
    expect(await service.searchImcProjects('R')).toEqual([]);
  });

  it('filters projects by name (case-insensitive)', async () => {
    mockFetch(STUB);
    const results = await service.searchImcProjects('river');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('imc-001');
  });

  it('filters projects by project number', async () => {
    mockFetch(STUB);
    const results = await service.searchImcProjects('2024-017');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('imc-002');
  });

  it('returns multiple matches when query overlaps several projects', async () => {
    mockFetch(STUB);
    // '2024' matches both imc-001 and imc-002 by project number
    const results = await service.searchImcProjects('2024');
    expect(results.length).toBe(2);
  });

  it('returns empty array when no project matches', async () => {
    mockFetch(STUB);
    const results = await service.searchImcProjects('zzz-no-match');
    expect(results).toEqual([]);
  });

  it('fetches stub data only once across multiple calls (cache)', async () => {
    mockFetch(STUB);
    await service.searchImcProjects('river');
    await service.searchImcProjects('oak');
    // fetch should have been called exactly once
    expect(window.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws when fetch fails', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response('not found', { status: 404 })),
    );
    await expectAsync(service.searchImcProjects('river')).toBeRejected();
  });
});
