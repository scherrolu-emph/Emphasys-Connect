import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  readonly session = signal<Session | null>(null);
  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly isHfa = computed(
    () => this.currentUser()?.user_metadata?.['is_hfa'] === true
  );

  constructor() {
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
    });
  }

  async restoreSession(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    this.session.set(data.session);
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signInWithOtp(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  }

  async verifyOtp(email: string, token: string): Promise<void> {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Fail-open: clear state and redirect even if signOut call errors
      console.error('signOut error (proceeding anyway):', error);
    }
    this.session.set(null);
    await this.router.navigate(['/login'], { replaceUrl: true });
  }
}
