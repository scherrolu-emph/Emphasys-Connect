// Hand-authored to match migrations 001–005.
// Regenerate with: npx supabase gen types typescript --project-id abytadbwhnrqxhbythir > src/app/core/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CaseType = 'blank' | 'development_construction' | 'loan_underwriting' | 'bond_issuance';
export type MilestoneStatus = 'open' | 'active' | 'completed';
export type PrerequisiteType = 'document_submission' | 'acceptance_comment';
export type PrerequisiteStatus = 'pending_open' | 'received_processing' | 'accepted';
export type ParticipantRole = 'hfa_staff' | 'developer';
export type InviteStatus = 'pending' | 'accepted';
export type ParticipantSource = 'imc' | 'manual' | 'creator';
export type MessageType = 'system' | 'message';
export type NotificationType = 'mention' | 'tagged' | 'assigned';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          hfa_id: string | null;
          email: string;
          display_name: string;
          is_hfa: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          hfa_id?: string | null;
          email: string;
          display_name: string;
          is_hfa?: boolean;
          created_at?: string;
        };
        Update: {
          hfa_id?: string | null;
          email?: string;
          display_name?: string;
          is_hfa?: boolean;
        };
      };
      cases: {
        Row: {
          id: string;
          hfa_id: string;
          title: string;
          reference_number: string | null;
          case_type: CaseType;
          imc_project_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hfa_id: string;
          title: string;
          reference_number?: string | null;
          case_type?: CaseType;
          imc_project_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          reference_number?: string | null;
          case_type?: CaseType;
          imc_project_id?: string | null;
          updated_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          hfa_id: string;
          case_id: string;
          title: string;
          order_index: number;
          status: MilestoneStatus;
          is_internal: boolean;
          target_days: number | null;
          activated_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hfa_id: string;
          case_id: string;
          title: string;
          order_index: number;
          status?: MilestoneStatus;
          is_internal?: boolean;
          target_days?: number | null;
          activated_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          order_index?: number;
          status?: MilestoneStatus;
          is_internal?: boolean;
          target_days?: number | null;
          activated_at?: string | null;
          completed_at?: string | null;
        };
      };
      prerequisites: {
        Row: {
          id: string;
          hfa_id: string;
          case_id: string;
          milestone_id: string;
          title: string;
          type: PrerequisiteType;
          status: PrerequisiteStatus;
          requested: boolean;
          returned: boolean;
          owner_id: string | null;
          upload_link: string | null;
          doc_name: string | null;
          notes: string | null;
          submitted_at: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hfa_id: string;
          case_id: string;
          milestone_id: string;
          title: string;
          type: PrerequisiteType;
          status?: PrerequisiteStatus;
          requested?: boolean;
          returned?: boolean;
          owner_id?: string | null;
          upload_link?: string | null;
          doc_name?: string | null;
          notes?: string | null;
          submitted_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: PrerequisiteStatus;
          requested?: boolean;
          returned?: boolean;
          owner_id?: string | null;
          upload_link?: string | null;
          doc_name?: string | null;
          notes?: string | null;
          submitted_at?: string | null;
          accepted_at?: string | null;
          updated_at?: string;
        };
      };
      case_participants: {
        Row: {
          id: string;
          hfa_id: string;
          case_id: string;
          user_id: string | null;
          email: string;
          role: ParticipantRole;
          invite_status: InviteStatus;
          source: ParticipantSource;
          created_at: string;
        };
        Insert: {
          id?: string;
          hfa_id: string;
          case_id: string;
          user_id?: string | null;
          email: string;
          role: ParticipantRole;
          invite_status?: InviteStatus;
          source?: ParticipantSource;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          invite_status?: InviteStatus;
        };
      };
      conversation_messages: {
        Row: {
          id: string;
          hfa_id: string;
          case_id: string;
          author_id: string | null;
          type: MessageType;
          content: string;
          mentions: string[];
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hfa_id: string;
          case_id: string;
          author_id?: string | null;
          type?: MessageType;
          content: string;
          mentions?: string[];
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          mentions?: string[];
          metadata?: Json | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          hfa_id: string;
          user_id: string;
          case_id: string | null;
          type: NotificationType;
          title: string;
          body: string;
          message_id: string | null;
          prereq_id: string | null;
          read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hfa_id: string;
          user_id: string;
          case_id?: string | null;
          type: NotificationType;
          title: string;
          body: string;
          message_id?: string | null;
          prereq_id?: string | null;
          read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read?: boolean;
          read_at?: string | null;
        };
      };
    };
    Enums: {
      case_type: CaseType;
      milestone_status: MilestoneStatus;
      prerequisite_type: PrerequisiteType;
      prerequisite_status: PrerequisiteStatus;
      participant_role: ParticipantRole;
      invite_status: InviteStatus;
      participant_source: ParticipantSource;
      message_type: MessageType;
      notification_type: NotificationType;
    };
  };
};
