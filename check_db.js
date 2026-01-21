
import mongoose from 'mongoose';

const checkConnection = async (port) => {
    const uri = `mongodb://127.0.0.1:${port}/test`;
    console.log(`Testing connection to ${uri}...`);
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`✅ Connection to port ${port} SUCCESSFUL`);
        await mongoose.disconnect();
    } catch (err) {
        console.log(`❌ Connection to port ${port} FAILED:`, err.message);
    }
};

const run = async () => {
    await checkConnection(27019);
    process.exit();
};

run();
