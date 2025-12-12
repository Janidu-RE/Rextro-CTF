import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Flag from './src/models/Flag.js';

dotenv.config({ path: '/Users/janinduhemachandra/Desktop/Rextro/CTF/backend/.env' });

const runDebug = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ctf-admin';
        await mongoose.connect(uri);
        console.log('Connected to DB at', uri);

        const collection = mongoose.connection.collection('flags');
        const indexes = await collection.indexes();
        console.log('CURRENT INDEXES:', JSON.stringify(indexes, null, 2));

        // Try to drop 'code_1' if it exists
        const codeIndex = indexes.find(idx => idx.name === 'code_1');
        if (codeIndex) {
            console.log('Found code_1 index. Attributes:', codeIndex);
            if (codeIndex.unique) {
                console.log('Index IS unique. Attempting to drop...');
                try {
                    await collection.dropIndex('code_1');
                    console.log('Index dropped successfully.');
                } catch (err) {
                    console.error('Failed to drop index:', err.message);
                }
            } else {
                console.log('Index is NOT unique. It should be fine.');
            }
        } else {
            console.log('No code_1 index found.');
        }

        // Now try to create a duplicate to verify
        console.log('Attempting to create duplicate flag...');
        try {
            const flag1 = new Flag({
                title: "Debug 1", description: "desc", code: "DUPE_TEST", points: 10, setNumber: 1
            });
            await flag1.save();
            console.log('Flag 1 saved.');

            const flag2 = new Flag({
                title: "Debug 2", description: "desc", code: "DUPE_TEST", points: 10, setNumber: 2
            });
            await flag2.save();
            console.log('Flag 2 saved (Success! Duplicates allowed).');

            // Cleanup
            await Flag.deleteOne({ _id: flag1._id });
            await Flag.deleteOne({ _id: flag2._id });

        } catch (err) {
            console.error('ERROR SAVING FLAGS:', err);
        }

        process.exit(0);

    } catch (error) {
        console.error('Top Level Error:', error);
        process.exit(1);
    }
};

runDebug();
