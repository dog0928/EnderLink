#!/usr/bin/env node
const { Octokit } = require('@octokit/rest');

function usage() {
  console.log('Usage: elder <command> [options] <serverName>');
  console.log('Commands:');
  console.log('  start  <server>   Start the server');
  console.log('  stop   <server>   Stop the server');
  console.log('  status <server>   Show server status');
  console.log('Options:');
  console.log('  --repo  <owner/repo>   GitHub repository (defaults to $GITHUB_REPOSITORY)');
  console.log('  --token <token>        GitHub token (defaults to $GITHUB_TOKEN)');
}

function getOption(args, name) {
  const index = args.indexOf(name);
  if (index !== -1 && args[index + 1]) return args[index + 1];
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const serverName = args[1];

  if (!command || command === '--help' || command === '-h') {
    usage();
    return;
  }

  const repo = getOption(args, '--repo') || process.env.GITHUB_REPOSITORY;
  const token = getOption(args, '--token') || process.env.GITHUB_TOKEN;
  if (!repo) {
    console.error('GitHub repository is required (use --repo or set GITHUB_REPOSITORY)');
    process.exit(1);
  }
  if (!token) {
    console.error('GitHub token is required (use --token or set GITHUB_TOKEN)');
    process.exit(1);
  }

  if (!serverName) {
    console.error('Missing server name');
    usage();
    process.exit(1);
  }

  const [owner, repoName] = repo.split('/');
  const octokit = new Octokit({ auth: token });

  switch (command) {
    case 'start':
      await octokit.repos.createDispatchEvent({
        owner,
        repo: repoName,
        event_type: 'start-server',
        client_payload: { server: serverName },
      });
      console.log(`Dispatch for server '${serverName}' sent`);
      break;
    case 'stop':
      await octokit.repos.createDispatchEvent({
        owner,
        repo: repoName,
        event_type: 'stop-server',
        client_payload: { server: serverName },
      });
      console.log(`Stop dispatch for server '${serverName}' sent`);
      break;
    case 'status':
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo: repoName,
          path: `${serverName}/status.txt`,
        });
        const content = Buffer.from(data.content, data.encoding).toString('utf8').trim();
        console.log(content);
      } catch (err) {
        console.error('Failed to get status:', err.message);
        process.exit(1);
      }
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
