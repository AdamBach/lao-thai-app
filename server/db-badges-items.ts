import { eq, and } from "drizzle-orm";
import { badges, userBadges, specialItems, userInventory } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get all badges
 */
export async function getAllBadges() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get badges: database not available");
    return [];
  }

  try {
    const result = await db.select().from(badges);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get badges:", error);
    throw error;
  }
}

/**
 * Get badge by ID
 */
export async function getBadgeById(badgeId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get badge: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(badges).where(eq(badges.id, badgeId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get badge:", error);
    throw error;
  }
}

/**
 * Get user badges
 */
export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user badges: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        id: userBadges.id,
        badgeId: userBadges.badgeId,
        unlockedAt: userBadges.unlockedAt,
        badge: badges,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get user badges:", error);
    throw error;
  }
}

/**
 * Award badge to user
 */
export async function awardBadgeToUser(userId: number, badgeId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot award badge: database not available");
    return;
  }

  try {
    // Check if user already has this badge
    const existing = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
      .limit(1);

    if (existing.length > 0) {
      console.log(`[Database] User ${userId} already has badge ${badgeId}`);
      return existing[0];
    }

    // Award badge
    const result = await db.insert(userBadges).values({
      userId,
      badgeId,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to award badge:", error);
    throw error;
  }
}

/**
 * Get all special items
 */
export async function getAllSpecialItems() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get special items: database not available");
    return [];
  }

  try {
    const result = await db.select().from(specialItems);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get special items:", error);
    throw error;
  }
}

/**
 * Get special item by ID
 */
export async function getSpecialItemById(itemId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get special item: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(specialItems)
      .where(eq(specialItems.id, itemId))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get special item:", error);
    throw error;
  }
}

/**
 * Get user inventory
 */
export async function getUserInventory(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user inventory: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        id: userInventory.id,
        itemId: userInventory.itemId,
        quantity: userInventory.quantity,
        usedCount: userInventory.usedCount,
        acquiredAt: userInventory.acquiredAt,
        item: specialItems,
      })
      .from(userInventory)
      .innerJoin(specialItems, eq(userInventory.itemId, specialItems.id))
      .where(eq(userInventory.userId, userId));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get user inventory:", error);
    throw error;
  }
}

/**
 * Add item to user inventory
 */
export async function addItemToInventory(userId: number, itemId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add item to inventory: database not available");
    return;
  }

  try {
    // Check if user already has this item
    const existing = await db
      .select()
      .from(userInventory)
      .where(and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId)))
      .limit(1);

    if (existing.length > 0) {
      // Update quantity
      const result = await db
        .update(userInventory)
        .set({
          quantity: existing[0].quantity + quantity,
        })
        .where(eq(userInventory.id, existing[0].id));

      return result;
    }

    // Add new item
    const result = await db.insert(userInventory).values({
      userId,
      itemId,
      quantity,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to add item to inventory:", error);
    throw error;
  }
}

/**
 * Use item from inventory
 */
export async function useItemFromInventory(userId: number, itemId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot use item: database not available");
    return;
  }

  try {
    const item = await db
      .select()
      .from(userInventory)
      .where(
        and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId))
      )
      .limit(1);

    if (item.length === 0) {
      console.warn(`[Database] Item not found in inventory for user ${userId}`);
      return;
    }

    const currentItem = item[0];
    const result = await db
      .update(userInventory)
      .set({
        usedCount: currentItem.usedCount + 1,
        quantity: currentItem.quantity - 1,
      })
      .where(eq(userInventory.id, currentItem.id));

    return result;
  } catch (error) {
    console.error("[Database] Failed to use item:", error);
    throw error;
  }
}

/**
 * Get badge by unlock condition
 */
export async function getBadgeByUnlockCondition(condition: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get badge: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(badges)
      .where(eq(badges.unlockedCondition, condition))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get badge:", error);
    throw error;
  }
}

/**
 * Get special item by unlock condition
 */
export async function getSpecialItemByUnlockCondition(condition: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get special item: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(specialItems)
      .where(eq(specialItems.unlockedCondition, condition))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get special item:", error);
    throw error;
  }
}
