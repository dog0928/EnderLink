#!/usr/bin/env node
const { Octokit } = require('@octokit/rest');

function usage() {
  console.log('Usage: elder start <serverName>');
}

async function main() {
  const [, , command, serverName] = process.argv;
  if (!command || command === '--help' || command === '-h') {
    usage();
    return;
  }

  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo) {
    console.error('GITHUB_REPOSITORY environment variable is required');
    process.exit(1);
  }
  if (!token) {
    console.error('GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  const [owner, repoName] = repo.split('/');
  const octokit = new Octokit({ auth: token });

  switch (command) {
    case 'start':
      if (!serverName) {
        console.error('Missing server name');
        usage();
        process.exit(1);
      }
      await octokit.repos.createDispatchEvent({
        owner,
        repo: repoName,
        event_type: 'start-server',
        client_payload: { server: serverName },
      });
      console.log(`Dispatch for server '${serverName}' sent`);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      usage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
