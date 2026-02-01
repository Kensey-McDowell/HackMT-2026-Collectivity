import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Configuration for mock data variety
const conditions = ["New/Mint", "Near Mint", "Lightly Used", "Damaged", "Refurbished"];
const years = Array.from({ length: 50 }, (_, i) => 1970 + i);

async function seedCollectables() {
    try {
        // 1. Admin Login
        await pb.admins.authWithPassword('devinlatham20@gmail.com', 'hackmt2026');
        console.log("🔓 Authenticated for Seeding...");

        // 2. Fetch all Categories and Tags to use as references
        const categories = await pb.collection('categories').getFullList();
        const allTags = await pb.collection('tags').getFullList();
        const globalCat = categories.find(c => c.name === "Global");

        if (!categories.length || !allTags.length) {
            throw new Error("Categories or Tags not found. Run import.js first!");
        }   

        console.log(`🌱 Starting seed of 50 items across ${categories.length} categories...`);

        for (let i = 1; i <= 50; i++) {
            // Pick a random category (excluding Global itself usually, or include it)
            const category = categories[Math.floor(Math.random() * categories.length)];
            
            // Filter tags: Must belong to THIS category OR the Global category
            const validTags = allTags.filter(t => 
                t.field === category.id || t.field === globalCat?.id
            );

            // Randomly pick 2-4 tags from the valid list
            const shuffled = validTags.sort(() => 0.5 - Math.random());
            const selectedTags = shuffled.slice(0, Math.min(validTags.length, Math.floor(Math.random() * 3) + 2));

            const mockItem = {
                name: `${category.name} Item #${i}`,
                description: `A high-quality collectible from the ${category.name} category. Authenticity guaranteed.`,
                category: category.id,
                tags: selectedTags.map(t => t.id),
                condition: conditions[Math.floor(Math.random() * conditions.length)],
                estimated_value: Math.floor(Math.random() * 5000) + 50,
                year: years[Math.floor(Math.random() * years.length)],
                created_by: pb.authStore.model?.id || "" // Assigns to admin if no user exists
            };

            await pb.collection('collectables').create(mockItem);
            console.log(`+ Created: ${mockItem.name} (${selectedTags.length} tags)`);
        }

        console.log("\n✅ 50 Collectables successfully seeded!");
    } catch (err) {
        console.error("❌ Seeding Failed:", err.message);
    }
}

seedCollectables();