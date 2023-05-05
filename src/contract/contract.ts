import { ActionInterface, StateInterface } from "./faces";

export function handle(state: StateInterface, action: ActionInterface) {
  const input = action.input;
  const caller = action.caller;

  if (input.function === "commit") {
    let success = false;
    for (let i = 0; i < state.branches.length; i++) {
      if (state.branches[i].id === input.branch) {
        // @ts-expect-error
        state.branches[i].commits.push(SmartWeave.transaction.id);
        return state;
      }
    }
    if (!success) {
      // @ts-expect-error
      throw new ContractError("Can't find branch to commit to");
    }

    return state;
  } else if (input.function === "createBranch") {
    state.branches.push({
      // @ts-expect-error
      id: SmartWeave.transaction.id,
      commits: [],
    });
    return state;
  } else if (input.function === "pullRequest") {
    // Check that PR isn't into itself
    if (input.from === input.to) {
      // @ts-expect-error
      throw new ContractError("Can't make a pull request into itself");
    }

    // Check that both branches exist
    let goodBranchCount = 0;
    for (let i = 0; i < state.branches.length; i++) {
      if (state.branches[i].id === input.from) {
        goodBranchCount++;
      }
      if (state.branches[i].id === input.to) {
        goodBranchCount++;
      }
    }
    if (goodBranchCount !== 2) {
      // @ts-expect-error
      throw new ContractError(
        "Either one or both of the branches do not exist"
      );
    }
    state.pullRequests.push({
      // @ts-expect-error
      id: SmartWeave.transaction.id,
      from: input.from,
      to: input.to,
    });

    return state;
  } else if (input.function === "mergePR") {
    let fromBranch: string = "";
    let toBranch: string = "";
    for (let i = 0; i < state.pullRequests.length; i++) {
      if (state.pullRequests[i].id === input.id) {
        fromBranch = state.pullRequests[i].from;
        toBranch = state.pullRequests[i].to;
      }
    }
    if (fromBranch === "" || toBranch === "") {
      // @ts-expect-error
      throw new ContractError("Couldn't find PR to merge");
    }

    for (let x = 0; x < state.branches.length; x++) {
      if (state.branches[x].id === fromBranch) {
        // Remove branch being merged
        state.branches.splice(x, 1);
      } else if (state.branches[x].id === toBranch) {
        // Set ID of new branch to be the latest
        state.branches[x].id = fromBranch;
      }
    }

    return state;
  } else if (input.function === "closePR") {
    for (let i = 0; i < state.pullRequests.length; i++) {
      if (state.pullRequests[i].id === input.id) {
        state.pullRequests.splice(i, 1);
        return state;
      }
    }

    return state;
  }
}
