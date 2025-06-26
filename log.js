import { db } from './firebase-config.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function logAction(action, message) {
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] [${action}] ${message}`);

    try {
        await addDoc(collection(db, 'logs'), {
            action,
            message,
            timestamp
        });
    } catch (error) {
        console.error("Failed to log action:", error);
    }
}
