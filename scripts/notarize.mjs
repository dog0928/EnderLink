import { notarize } from '@electron/notarize';

export default async function notarizeApp(context) {
  if (process.platform !== 'darwin') {
    return;
  }

  const { appOutDir, packager } = context;
  const appName = packager.appInfo.productFilename;

  if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD) {
    console.warn('Apple credentials are not set; skipping notarization');
    return;
  }

  await notarize({
    appBundleId: 'enderlink',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
  });
}
