import { Event } from 'vscode';

export interface Configuration {
    username: string | undefined;
	host: string;
    repositories: string[];
    accessToken: string | undefined;
    onDidChange: Event<Configuration>;
}