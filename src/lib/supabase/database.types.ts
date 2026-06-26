export interface Database {
  public: {
    Tables: {
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
