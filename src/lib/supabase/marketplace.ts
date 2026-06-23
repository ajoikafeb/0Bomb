import type { MarketplaceListing } from "@/lib/game/types";
import { supabase } from "./client";

function isConnected(): boolean {
  return typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export async function fetchActiveListings(): Promise<MarketplaceListing[]> {
  if (!isConnected()) return [];
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("Supabase fetchActiveListings error:", error.message);
    return [];
  }
  return (data as MarketplaceListing[]) || [];
}

export async function createListingRemote(listing: MarketplaceListing): Promise<boolean> {
  if (!isConnected()) return false;
  const { error } = await supabase.from("marketplace_listings").insert([listing]);
  if (error) {
    console.warn("Supabase createListing error:", error.message);
    return false;
  }
  return true;
}

export async function updateListingStatus(listingId: string, status: "cancelled" | "sold"): Promise<boolean> {
  if (!isConnected()) return false;
  const { error } = await supabase
    .from("marketplace_listings")
    .update({ status })
    .eq("id", listingId);
  if (error) {
    console.warn("Supabase updateListingStatus error:", error.message);
    return false;
  }
  return true;
}

export async function deleteListingRemote(listingId: string): Promise<boolean> {
  if (!isConnected()) return false;
  const { error } = await supabase
    .from("marketplace_listings")
    .delete()
    .eq("id", listingId);
  if (error) {
    console.warn("Supabase deleteListing error:", error.message);
    return false;
  }
  return true;
}
