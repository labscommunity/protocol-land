<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    breadCrumb: Array<{
      fileName: string,
      fileHash: string
    }>,
    to: String,
    from: String
  }
});

</script>

<template>

<nav class="breadcrumb" aria-label="breadcrumbs">
  <ul>
    <li v-for="crumb in breadCrumb"><a :href="crumb.fileHash">{{ crumb.fileName }}</a></li>
    <!-- <li><a href="#">Documentation</a></li>
    <li><a href="#">Components</a></li>
    <li class="is-active"><a href="#" aria-current="page">Breadcrumb</a></li> -->
  </ul>
</nav>

<div class="block">
  <code-diff
    :old-string="'12345'"
    :new-string="'3456'"
    output-format="line-by-line"/>
</div>

</template>

<style scoped>


</style>