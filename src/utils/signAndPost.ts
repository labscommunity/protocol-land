import { getAuthMethod } from "./auth";
import {
  createAndPostTransactionWOthent,
  createTransaction,
} from "permawebjs/transaction";

export async function dispatchTransaction(data: any, tags: any) {
  const authMethod = getAuthMethod();
  if (authMethod === "othent") {
    try {
      const result = await createAndPostTransactionWOthent({
        othentFunction: "uploadData",
        data,
        tags,
      });
      return {
        success: result.success,
        id: result.transactionId,
        message: "Uploaded data successfully",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err,
      };
    }
  } else if (authMethod === "arconnect") {
    try {
      const transaction = await createTransaction({
        type: "data",
        data: data,
        // TODO @t8 inform rohit that environment param is not marked as optional but is marked optional in docs
        environment: "mainnet",
        options: {
          tags,
          useBundlr: false,
          signAndPost: true,
        },
      });
      console.log(transaction);
      return {
        success: true,
        id: transaction.postedTransaction.id,
        message: "Uploaded data successfully",
      };
    } catch (err) {
      return {
        success: false,
        message: err,
      };
    }
  } else {
    // Throw error saying not logged in
    return {
      success: false,
      message: "Not logged in",
    };
  }
}
