import { GitRemote } from './models/remote';
import { exec, allMatches } from '../utils';
import { fill } from 'git-credential-node';
import { WorkspaceFolder } from 'vscode';


export async function getGitHubRemotes(workspaceFolders: WorkspaceFolder[], host: string, repositories: string[]) {
    const remotes: Record<string, GitRemote> = {};
    for (const folder of workspaceFolders || []) {
        try {
            const { stdout } = await exec('git remote -v', { cwd: folder.uri.fsPath });
            for (const url of new Set(allMatches(/^[^\s]+\s+([^\s]+)/gm, stdout, 1))) {
                const m = new RegExp(`[^\\s]*${host.replace(/\./g, '\\.')}[/:]([^/]+)\/([^ ]+)[^\\s]*`).exec(url);

                if (m) {
                    const [url, owner, rawRepo] = m;
                    const repo = rawRepo.replace(/\.git$/, '');
                    let remote = remotes[`${owner}/${repo}`];
                    if (!remote) {
                        const data = await fill(url);
                        remote = { url, owner, repo, username: data && data.username, password: data && data.password, folders: [] };
                        remotes[`${owner}/${repo}`] = remote;
                    }
                    remote.folders.push(folder);
                }
            }
        } catch (e) {
            // ignore
        }
    }
    for (const rawRepo of repositories) {
        const m = /^\s*([^/\s]+)\/([^/\s]+)\s*$/.exec(rawRepo);
        if (m) {
            const [, owner, repo] = m;
            let remote = remotes[`${owner}/${repo}`];
            if (!remote) {
                const url = `https://${host}/${owner}/${repo}.git`;
                const data = await fill(url);
                remote = { url, owner, repo, username: data && data.username, password: data && data.password, folders: [] };
                remotes[`${owner}/${repo}`] = remote;
            }
        }
    }
    return Object.keys(remotes)
        .map(key => remotes[key]);
}
