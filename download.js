const fs = require('fs');
const path = require('path');

const screens = [
  { name: 'challenge_details', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1M2Q1OWJmOWFiMGQwMWE2MzE5N2Y4MDA1YzI5EgsSBxDE2pL4zQQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MjEwNDk2NTI1NTcwNzQxOTA5&filename=&opi=89354086' },
  { name: 'leaderboard', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1M2Q1ZGVkZWY1NjMwNmMyNTQzMTg3MWE0MzY5EgsSBxDE2pL4zQQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MjEwNDk2NTI1NTcwNzQxOTA5&filename=&opi=89354086' },
  { name: 'projects_explorer', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1M2Q1YTBmOTk3YWYwMzM4NWUwNzkyMmNjZThhEgsSBxDE2pL4zQQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MjEwNDk2NTI1NTcwNzQxOTA5&filename=&opi=89354086' },
  { name: 'admin_review_queue', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1M2Q1ZGVkMGQ4NzkwNDczNTgyNmUzMzFhMDQ1EgsSBxDE2pL4zQQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MjEwNDk2NTI1NTcwNzQxOTA5&filename=&opi=89354086' },
  { name: 'solution_submission', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1M2Q1YTQwZmRjMzEwOTM0ZjJiYjMwMjc1NzVjEgsSBxDE2pL4zQQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MjEwNDk2NTI1NTcwNzQxOTA5&filename=&opi=89354086' },
  { name: 'my_journey', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1M2Q1ZGVhMWFkZTkwNDczNTgyNmUzMzFhMDQ1EgsSBxDE2pL4zQQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MjEwNDk2NTI1NTcwNzQxOTA5&filename=&opi=89354086' },
  { name: 'challenges_explorer', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1M2Q1ZGYwMzgwODUwODE2ZDQ3NjI0MDRjYTc5EgsSBxDE2pL4zQQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MjEwNDk2NTI1NTcwNzQxOTA5&filename=&opi=89354086' },
  { name: 'manage_challenges', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1M2Q1YTRjODNhMmYwODE2ZDQ3NjI0MDRjYTc5EgsSBxDE2pL4zQQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MjEwNDk2NTI1NTcwNzQxOTA5&filename=&opi=89354086' },
  { name: 'crystal_journey_dashboard', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2U2MWJhMDg5MGYyZTQ3YTY5YTI2M2QzMjM0MzNjYzBkEgsSBxDE2pL4zQQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MjEwNDk2NTI1NTcwNzQxOTA5&filename=&opi=89354086' },
];

const outputDir = path.join(__dirname, 'stitch_screens');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function download(screen) {
  const dest = path.join(outputDir, `${screen.name}.html`);
  console.log(`Downloading ${screen.name} to ${dest}...`);
  try {
    const res = await fetch(screen.url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const text = await res.text();
    fs.writeFileSync(dest, text, 'utf8');
    console.log(`Successfully downloaded ${screen.name}`);
  } catch (err) {
    console.error(`Failed to download ${screen.name}:`, err);
  }
}

async function main() {
  for (const screen of screens) {
    await download(screen);
  }
  console.log('Done!');
}

main();
