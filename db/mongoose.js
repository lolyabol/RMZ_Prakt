import mongoose from 'mongoose';

export async function connectToMongo() {
  try {
    mongoose.connect('mongodb+srv://vturilasy:1f3t48y2@papercutlogs.hembkvp.mongodb.net/?retryWrites=true&w=majority&appName=papercutLogs');
    console.log('✅ Подключено к MongoDB');
  } catch (err) {
    console.error('❌ Ошибка подключения к MongoDB:', err);
    throw err;
  }
}
