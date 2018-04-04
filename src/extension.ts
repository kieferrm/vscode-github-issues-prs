'use strict';

import { ExtensionContext, window, EventEmitter, Event, workspace } from 'vscode';
import { GitHubIssuesPrsProvider } from './github-issues-prs';
import { PullRequestProvider } from './pullRequestProvider';
import { Configuration as IConfiguration } from './configuration';



class Configuration implements IConfiguration {
	onDidChange: Event<IConfiguration>;

	private emitter: EventEmitter<IConfiguration>;

	constructor(public username: string | undefined, public repositories: string[] = [], public host: string = 'github.com', public accessToken: string) {
		this.emitter = new EventEmitter<IConfiguration>();
		this.onDidChange = this.emitter.event;
	}

	update(username, repositories = [], host = 'github.com', accessToken) {
		if (username !== this.username || JSON.stringify(repositories) !== JSON.stringify(this.repositories) || host !== this.host || accessToken !== this.accessToken) {
			this.username = username;
			this.repositories = repositories;
			this.host = host;
			this.accessToken = accessToken;
			this.emitter.fire(this);
		}
	}
}


export function activate(context: ExtensionContext) {

	const subscriptions = context.subscriptions;

	const config = workspace.getConfiguration('github');
	const configuration = new Configuration(config.get<string>('username'), config.get<string[]>('repositories'), config.get<string>('host'), config.get<string>('accessToken'));
	subscriptions.push(workspace.onDidChangeConfiguration(() => {
		const config = workspace.getConfiguration('github');
		configuration.update(config.get<string>('username'), config.get<string[]>('repositories'), config.get<string>('host'), config.get<string>('accessToken'));
	}));


	window.registerTreeDataProvider('githubIssuesPrs', new GitHubIssuesPrsProvider(context, configuration));
	new PullRequestProvider(configuration).activate(context);
}
