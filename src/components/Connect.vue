<script lang="ts">
import { defineComponent } from "vue";
import { ArConnect, Othent } from "permawebjs/auth";

export default defineComponent({
  methods: {
    cancel() {
      this.$emit("cancel-connect", "cancel");
    },
    async clickedArConnect() {
      try {
        await ArConnect.connect({
          permissions: ["ACCESS_ADDRESS", "DISPATCH", "SIGN_TRANSACTION"],
        });
      } catch (err) {
        console.log(err);
      }
      this.setCurrentWallet(await ArConnect.getActiveAddress());
      localStorage.setItem("authMethod", "arconnect");
    },
    async clickedOthent() {
      let response;
      try {
        response = await Othent.logIn();
      } catch (err) {
        console.log(err);
      }
      if (response) {
        // @TODO: Report response.success proposed type doesn't exist to permawebjs team
        this.setCurrentWallet(response.contract_id);
        localStorage.setItem("authMethod", "othent");
      } else {
        console.log("Something failed with the login...");
      }
    },
    setCurrentWallet(address: string) {
      localStorage.setItem("currentAddress", address);
      this.$emit("connected", "success");
    },
  },
});
</script>

<template>
  <div class="modal is-active">
    <div class="modal-background" @click="cancel"></div>
    <div class="modal-card">
      <section class="modal-card-body">
        <div class="columns">
          <div class="column is-half">
            <button @click="clickedOthent()" class="button is-fullwidth othent">
              ⚡️ Sign in with Othent
            </button>
          </div>
          <div class="column is-half">
            <button
              @click="clickedArConnect()"
              class="button is-fullwidth arconnect"
            >
              🦔 Connect with ArConnect
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.modal-card {
  border-radius: 10px;
}

.button {
  padding: 50px;
}

.othent {
  background: rgb(211, 227, 252);
}

.arconnect {
  background: rgba(171, 154, 255, 0.3);
}
</style>
