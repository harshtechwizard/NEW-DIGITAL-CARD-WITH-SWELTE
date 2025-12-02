#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * 
 * This script checks if the SvelteKit app is ready for deployment
 * Run: node verify-deployment.js
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checks = [];
let hasErrors = false;

function check(name, condition, errorMsg, successMsg) {
	if (condition) {
		checks.push({ name, status: '✅', message: successMsg });
	} else {
		checks.push({ name, status: '❌', message: errorMsg });
		hasErrors = true;
	}
}

console.log('\n🔍 Pre-Deployment Verification\n');
console.log('='.repeat(50));

// Check 1: Environment variables example file exists
check(
	'Environment Variables',
	existsSync(join(__dirname, '.env.example')),
	'.env.example file not found',
	'.env.example file exists'
);

// Check 2: Package.json exists and has required scripts
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
check(
	'Build Script',
	packageJson.scripts && packageJson.scripts.build,
	'Build script not found in package.json',
	'Build script configured'
);

check(
	'Dev Script',
	packageJson.scripts && packageJson.scripts.dev,
	'Dev script not found in package.json',
	'Dev script configured'
);

// Check 3: Svelte config exists
check(
	'Svelte Config',
	existsSync(join(__dirname, 'svelte.config.js')),
	'svelte.config.js not found',
	'svelte.config.js exists'
);

// Check 4: Vercel adapter installed
check(
	'Vercel Adapter',
	packageJson.dependencies && packageJson.dependencies['@sveltejs/adapter-vercel'],
	'@sveltejs/adapter-vercel not installed',
	'Vercel adapter installed'
);

// Check 5: Supabase dependencies installed
check(
	'Supabase SSR',
	packageJson.dependencies && packageJson.dependencies['@supabase/ssr'],
	'@supabase/ssr not installed',
	'Supabase SSR installed'
);

check(
	'Supabase JS',
	packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js'],
	'@supabase/supabase-js not installed',
	'Supabase JS installed'
);

// Check 6: Required directories exist
check(
	'Source Directory',
	existsSync(join(__dirname, 'src')),
	'src/ directory not found',
	'src/ directory exists'
);

check(
	'Routes Directory',
	existsSync(join(__dirname, 'src', 'routes')),
	'src/routes/ directory not found',
	'src/routes/ directory exists'
);

// Check 7: .gitignore exists and excludes .env
const gitignoreExists = existsSync(join(__dirname, '.gitignore'));
let gitignoreValid = false;
if (gitignoreExists) {
	const gitignore = readFileSync(join(__dirname, '.gitignore'), 'utf-8');
	gitignoreValid = gitignore.includes('.env');
}
check(
	'Git Ignore',
	gitignoreValid,
	'.gitignore missing or does not exclude .env files',
	'.gitignore properly configured'
);

// Check 8: No .env file in repository (should use .env.example)
const envExists = existsSync(join(__dirname, '.env'));
check(
	'Environment File',
	envExists, // We want .env to exist for local dev
	'.env file not found (create from .env.example)',
	'.env file exists (ensure it\'s in .gitignore)'
);

// Check 9: TypeScript config exists
check(
	'TypeScript Config',
	existsSync(join(__dirname, 'tsconfig.json')),
	'tsconfig.json not found',
	'TypeScript configured'
);

// Check 10: Hooks file exists
check(
	'Server Hooks',
	existsSync(join(__dirname, 'src', 'hooks.server.ts')),
	'src/hooks.server.ts not found',
	'Server hooks configured'
);

// Print results
console.log('\n');
checks.forEach(({ name, status, message }) => {
	console.log(`${status} ${name}`);
	console.log(`   ${message}\n`);
});

console.log('='.repeat(50));

if (hasErrors) {
	console.log('\n❌ Verification failed! Please fix the issues above.\n');
	process.exit(1);
} else {
	console.log('\n✅ All checks passed! Ready for deployment.\n');
	console.log('Next steps:');
	console.log('1. Ensure environment variables are set in Vercel');
	console.log('2. Add deployment URL to Supabase redirect URLs');
	console.log('3. Run: npm run build (to test locally)');
	console.log('4. Deploy via Vercel Dashboard or CLI\n');
	process.exit(0);
}
