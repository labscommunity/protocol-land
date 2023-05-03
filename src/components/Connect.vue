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
      <header class="modal-card-head">
        <p class="modal-card-title">Modal title</p>
        <button @click="cancel" class="delete" aria-label="close"></button>
      </header>
      <section class="modal-card-body">
        <!-- Content ... -->
        <p>Hello world</p>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success">Save changes</button>
        <button class="button">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>

</style>
