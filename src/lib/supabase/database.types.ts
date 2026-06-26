export interface Database {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string;
          owner_wallet: string;
          type: string;
          title: string;
          body: string;
          data: unknown;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_wallet: string;
          type?: string;
          title: string;
          body?: string;
          data?: unknown;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_wallet?: string;
          type?: string;
          title?: string;
          body?: string;
          data?: unknown;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      marketplace_listings: {
        Row: {
          id: string;
          seller: string;
          item_type: "hero" | "equipment" | "cosmetic" | "cryopod" | "potion";
          item_id: string;
          price: string;
          status: "active" | "sold" | "cancelled";
          created_at: string;
        };
        Insert: {
          id: string;
          seller: string;
          item_type: "hero" | "equipment" | "cosmetic" | "cryopod" | "potion";
          item_id: string;
          price: string;
          status: "active" | "sold" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          seller?: string;
          item_type?: "hero" | "equipment" | "cosmetic" | "cryopod" | "potion";
          item_id?: string;
          price?: string;
          status?: "active" | "sold" | "cancelled";
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address: string;
          spout_balance: number;
          created_at: string;
        };
        Insert: {
          address: string;
          spout_balance?: number;
          created_at?: string;
        };
        Update: {
          address?: string;
          spout_balance?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      heroes: {
        Row: {
          id: string;
          owner_address: string;
          name: string;
          class: string;
          rarity: string;
          level: number;
          xp: number;
          energy: number;
          max_energy: number;
          generation: number;
          legacy_tier: string | null;
          is_alive: boolean;
          is_legendary: boolean;
          personality: unknown;
          intelligence: unknown;
          traits: string[];
          equipment: unknown;
          badges: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          owner_address: string;
          name: string;
          class: string;
          rarity: string;
          level?: number;
          xp?: number;
          energy: number;
          max_energy: number;
          generation?: number;
          legacy_tier?: string | null;
          is_alive?: boolean;
          is_legendary?: boolean;
          personality?: unknown;
          intelligence?: unknown;
          traits?: string[];
          equipment?: unknown;
          badges?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_address?: string;
          name?: string;
          class?: string;
          rarity?: string;
          level?: number;
          xp?: number;
          energy?: number;
          max_energy?: number;
          generation?: number;
          legacy_tier?: string | null;
          is_alive?: boolean;
          is_legendary?: boolean;
          personality?: unknown;
          intelligence?: unknown;
          traits?: string[];
          equipment?: unknown;
          badges?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          id: string;
          owner: string;
          name: string;
          type: string;
          rarity: string;
          slot: string;
          stats: unknown;
          equipped: boolean;
          soulbound: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          owner: string;
          name: string;
          type: string;
          rarity?: string;
          slot?: string;
          stats?: unknown;
          equipped?: boolean;
          soulbound?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner?: string;
          name?: string;
          type?: string;
          rarity?: string;
          slot?: string;
          stats?: unknown;
          equipped?: boolean;
          soulbound?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      cosmetics: {
        Row: {
          id: string;
          owner: string;
          name: string;
          type: string;
          rarity: string;
          preview: string;
          equipped: boolean;
          soulbound: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          owner: string;
          name: string;
          type?: string;
          rarity?: string;
          preview?: string;
          equipped?: boolean;
          soulbound?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner?: string;
          name?: string;
          type?: string;
          rarity?: string;
          preview?: string;
          equipped?: boolean;
          soulbound?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_config: {
        Row: {
          id: number;
          reward_multiplier: number;
          currency_drop_rate: number;
          equipment_drop_rate: number;
          cosmetic_drop_rate: number;
          upgrade_seed_drop_rate: number;
          rare_loot_drop_rate: number;
          event_reward_multiplier: number;
          maintenance_mode: boolean;
          marketplace_enabled: boolean;
          trading_enabled: boolean;
          reward_claims_enabled: boolean;
          currency_conversion_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          reward_multiplier?: number;
          currency_drop_rate?: number;
          equipment_drop_rate?: number;
          cosmetic_drop_rate?: number;
          upgrade_seed_drop_rate?: number;
          rare_loot_drop_rate?: number;
          event_reward_multiplier?: number;
          maintenance_mode?: boolean;
          marketplace_enabled?: boolean;
          trading_enabled?: boolean;
          reward_claims_enabled?: boolean;
          currency_conversion_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: number;
          reward_multiplier?: number;
          currency_drop_rate?: number;
          equipment_drop_rate?: number;
          cosmetic_drop_rate?: number;
          upgrade_seed_drop_rate?: number;
          rare_loot_drop_rate?: number;
          event_reward_multiplier?: number;
          maintenance_mode?: boolean;
          marketplace_enabled?: boolean;
          trading_enabled?: boolean;
          reward_claims_enabled?: boolean;
          currency_conversion_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          id: string;
          hero_id: string;
          event: string;
          detail: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hero_id: string;
          event: string;
          detail?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          hero_id?: string;
          event?: string;
          detail?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      maps: {
        Row: {
          id: string;
          owner_address: string;
          biome: string;
          difficulty: string;
          hero_ids: string[];
          cleared: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_address: string;
          biome: string;
          difficulty: string;
          hero_ids?: string[];
          cleared?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_address?: string;
          biome?: string;
          difficulty?: string;
          hero_ids?: string[];
          cleared?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      legacies: {
        Row: {
          id: string;
          hero_id: string;
          tier: string;
          transferred_to: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hero_id: string;
          tier: string;
          transferred_to?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hero_id?: string;
          tier?: string;
          transferred_to?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
