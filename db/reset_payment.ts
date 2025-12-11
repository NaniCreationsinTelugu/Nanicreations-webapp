import { db } from "./drizzle";
import { paymentSession } from "./schema";

async function main() {
    console.log("Clearing payment_sessions table...");
    try {
        await db.delete(paymentSession);
        console.log("Done.");
    } catch (e) {
        console.error("Error clearing table (might be due to schema mismatch):", e);
        // If schema mismatch prevents deletion using ORM, we might need raw SQL
        // But let's try this first.
    }
}

main().then(() => process.exit(0));
