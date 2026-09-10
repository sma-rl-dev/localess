import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const uid = 'seed-admin';
const spaceId = 'northstar-product';
const email = 'alex.morgan@northstar.example';
const password = 'LocalessSeed!2026';
const at = Timestamp.fromDate(new Date('2030-01-15T12:00:00Z'));
const admin = { name: 'Alex Morgan', email };
const app = initializeApp({ projectId: 'demo-localess-dev' });
const auth = getAuth(app);
const db = getFirestore(app);

const documents = {
  'configs/setup': { createdAt: at },
  [`users/${uid}`]: {
    email,
    emailVerified: true,
    displayName: admin.name,
    disabled: false,
    role: 'admin',
    providers: ['password'],
    createdAt: at,
    updatedAt: at,
  },
  [`spaces/${spaceId}`]: {
    name: 'Northstar Product',
    locales: [
      { id: 'en', name: 'English' },
      { id: 'de', name: 'German' },
      { id: 'fr', name: 'French' },
    ],
    localeFallback: { id: 'en', name: 'English' },
    environments: [{ name: 'Production', url: 'https://product.northstar.example' }],
    overview: {
      translationsCount: 3,
      translationsSize: 186,
      assetsCount: 0,
      assetsSize: 0,
      contentsCount: 2,
      contentsSize: 212,
      schemasCount: 1,
      tasksCount: 0,
      tasksSize: 0,
      totalSize: 398,
      updatedAt: at,
    },
    progress: { translations: { en: 3, de: 2, fr: 1 } },
    createdAt: at,
    updatedAt: at,
  },
  [`spaces/${spaceId}/schemas/landing-page`]: {
    type: 'ROOT',
    displayName: 'Landing Page',
    description: 'Product marketing page',
    fields: [
      { name: 'title', displayName: 'Title', kind: 'TEXT', required: true, translatable: true },
      { name: 'summary', displayName: 'Summary', kind: 'TEXTAREA', translatable: true },
      { name: 'reference', displayName: 'Reference', kind: 'TEXT', required: true, translatable: false },
    ],
    createdAt: at,
    updatedAt: at,
  },
  [`spaces/${spaceId}/contents/release-notes`]: {
    kind: 'DOCUMENT',
    name: 'Spring Release Notes',
    slug: 'spring-release-notes',
    parentSlug: '',
    fullSlug: 'spring-release-notes',
    schema: 'landing-page',
    data: { _id: 'release-notes', _schema: 'landing-page', schema: 'landing-page', title: 'Spring release notes', summary: 'A reliable multilingual release summary.', reference: 'NORTHSTAR-2026' },
    updatedBy: admin,
    publishedAt: at,
    createdAt: at,
    updatedAt: at,
  },
  [`spaces/${spaceId}/contents/pricing`]: {
    kind: 'DOCUMENT',
    name: 'Pricing Overview',
    slug: 'pricing',
    parentSlug: '',
    fullSlug: 'pricing',
    schema: 'landing-page',
    data: { _id: 'pricing', _schema: 'landing-page', schema: 'landing-page', title: 'Pricing overview', summary: 'Plans for growing product teams.', reference: 'NORTHSTAR-2026-PRICING' },
    updatedBy: admin,
    createdAt: at,
    updatedAt: at,
  },
  [`spaces/${spaceId}/translations/navigation.home`]: {
    type: 'STRING', locales: { en: 'Home', de: 'Startseite', fr: 'Accueil' }, labels: ['navigation'], description: 'Primary navigation label', updatedBy: admin, createdAt: at, updatedAt: at,
  },
  [`spaces/${spaceId}/translations/pricing.headline`]: {
    type: 'STRING', locales: { en: 'Plans that scale with your team', de: 'Pläne für wachsende Teams' }, labels: ['marketing'], description: 'Pricing page headline', updatedBy: admin, createdAt: at, updatedAt: at,
  },
  [`spaces/${spaceId}/translations/release.summary`]: {
    type: 'STRING', locales: { en: 'Ship localized product updates with confidence' }, labels: ['release'], description: 'Spring release summary', updatedBy: admin, createdAt: at, updatedAt: at,
  },
};

async function seed() {
  try {
    await auth.updateUser(uid, { email, password, displayName: admin.name, emailVerified: true, disabled: false });
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    await auth.createUser({ uid, email, password, displayName: admin.name, emailVerified: true, disabled: false });
  }
  await auth.setCustomUserClaims(uid, { role: 'admin' });
  const batch = db.batch();
  for (const [path, data] of Object.entries(documents)) batch.set(db.doc(path), data);
  await batch.commit();
  console.log(`Seeded ${email}, ${spaceId}, 3 translations, 2 content documents, and 1 schema.`);
}

async function verify() {
  const user = await auth.getUser(uid);
  if (user.email !== email || user.customClaims?.role !== 'admin') throw new Error('seed admin is incorrect');
  const login = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=tester-env', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!login.ok) throw new Error('seed admin cannot log in');
  const [space, translations, contents, schemas] = await Promise.all([
    db.doc(`spaces/${spaceId}`).get(),
    db.collection(`spaces/${spaceId}/translations`).get(),
    db.collection(`spaces/${spaceId}/contents`).get(),
    db.collection(`spaces/${spaceId}/schemas`).get(),
  ]);
  if (!space.exists || space.data().name !== 'Northstar Product' || translations.size !== 3 || contents.size !== 2 || schemas.size !== 1) {
    throw new Error('seed data is incomplete');
  }
  console.log(`Verified ${email}, Northstar Product, translations=3, contents=2, schemas=1.`);
}

if (process.argv[2] === 'seed') await seed();
else if (process.argv[2] === 'verify') await verify();
else throw new Error('usage: node functions/tester-env-data.mjs {seed|verify}');
