export interface StateInterface {
  forkOf: string;
  branches: Array<Branch>;
  pullRequests: Array<PullRequest>;
}

export interface ActionInterface {
  input:
    | CommitInterface
    | CreateBranchInterface
    | PullRequestInterface
    | MergePullRequest
    | ClosePullRequest;
  caller: string;
}

export interface CommitInterface {
  function: "commit";
  branch: string;
}

export interface CreateBranchInterface {
  function: "createBranch";
}

export interface PullRequestInterface {
  function: "pullRequest";
  from: string;
  to: string;
}

export interface MergePullRequest {
  function: "mergePR";
  id: string;
}

export interface ClosePullRequest {
  function: "closePR";
  id: string;
}

interface PullRequest {
  id: string;
  from: string;
  to: string;
}

interface Branch {
  id: string;
  commits: Array<Commit>;
}

interface Commit {
  id: string;
}
