<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent ({
  methods: {
    cancel() {
      this.$emit("cancel-connect", "cancel");
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
          <div class="column is-half ">
            <a href="" class="button is-fullwidth othent">
              ⚡️ Sign in with Othent
            </a>
          </div>
          <div class="column is-half">
            <a href="" class="button is-fullwidth arconnect">
              🦔 Connect with ArConnect
            </a>
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
