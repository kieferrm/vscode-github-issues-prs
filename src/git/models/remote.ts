
import { WorkspaceFolder } from 'vscode';

export interface GitRemote {
	url: string;
	owner: string;
	repo: string;
	username: string;
	password: string;
	folders: WorkspaceFolder[];
}