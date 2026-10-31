require('dotenv').config();
const mongoose = require('mongoose');

const migrate = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGO_URI or MONGODB_URI before running this migration.');

  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('businessplans');
  const collectionExists = await mongoose.connection.db
    .listCollections({ name: 'businessplans' }, { nameOnly: true })
    .hasNext();
  if (!collectionExists) await mongoose.connection.db.createCollection('businessplans');
  const indexes = await collection.indexes();
  const existingUniqueIndex = indexes.find((index) => (
    index.unique
    && index.key?.company_id === 1
    && index.key?.section_type === 1
    && Object.keys(index.key).length === 2
  ));

  if (existingUniqueIndex) {
    await collection.dropIndex(existingUniqueIndex.name);
  }

  await collection.createIndex(
    { company_id: 1, section_type: 1 },
    {
      name: 'company_id_1_section_type_1',
      unique: true,
      partialFilterExpression: { deleted_at: null },
    }
  );
  await mongoose.disconnect();
  console.log('Soft-delete indexes migrated.');
};

migrate().catch(async (error) => {
  console.error('Soft-delete index migration failed:', error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
